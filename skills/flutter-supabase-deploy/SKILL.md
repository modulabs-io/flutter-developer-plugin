# /flutter-supabase-deploy

Deploy Supabase migrations, Edge Functions, and storage configuration.

## Usage

```
/flutter-supabase-deploy [target] [options]
```

## Targets

- `db`: Push database migrations
- `functions`: Deploy Edge Functions
- `storage`: Configure storage buckets
- `all`: Deploy everything

## Options

- `--project <ref>`: Target specific project
- `--dry-run`: Preview changes without applying

## Examples

```
/flutter-supabase-deploy db
/flutter-supabase-deploy functions
/flutter-supabase-deploy all
```

## Instructions

When the user invokes `/flutter-supabase-deploy`, follow these steps:

### 1. Verify CLI and Login

```bash
# Check Supabase CLI
supabase --version

# Login if needed
supabase login

# Check linked project
supabase projects list
```

### 2. Deploy Database Migrations

```bash
# View pending migrations
supabase db diff

# Push migrations to remote
supabase db push

# Or reset and apply all migrations
supabase db reset --linked
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name

# Deploy with secrets
supabase secrets set MY_SECRET=value
supabase functions deploy function-name
```

#### Create Edge Function

```bash
# Create new function
supabase functions new my-function
```

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data, error } = await req.json()
    if (error) throw error

    // Your logic here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 4. Configure Storage Buckets

```sql
-- supabase/migrations/{{timestamp}}_create_storage_buckets.sql

-- Create public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Create private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('private', 'private', false)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 5242880) -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Public bucket: anyone can read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Public bucket: authenticated can upload
CREATE POLICY "Authenticated can upload to public"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');

-- Avatars: users can manage their own
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 5. Set Environment Secrets

```bash
# Set secrets for functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set SENDGRID_API_KEY=SG.xxx

# List secrets
supabase secrets list

# Unset secret
supabase secrets unset SECRET_NAME
```

### 6. Configure Webhooks (via Dashboard)

1. Database > Webhooks
2. Create webhook:
   - Name: `order-created`
   - Table: `orders`
   - Events: `INSERT`
   - URL: Edge Function URL

### 7. Configure Realtime

```sql
-- Enable realtime for table
ALTER PUBLICATION supabase_realtime ADD TABLE {{table}};

-- Or via migration
CREATE OR REPLACE FUNCTION enable_realtime()
RETURNS void AS $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
END;
$$ LANGUAGE plpgsql;

SELECT enable_realtime();
```

### 8. Pre-Deployment Checklist

```yaml
database_checklist:
  - [ ] All migrations tested locally
  - [ ] RLS policies cover all operations
  - [ ] Indexes created for frequent queries
  - [ ] Foreign keys properly defined
  - [ ] Triggers tested

functions_checklist:
  - [ ] Functions tested locally
  - [ ] Error handling implemented
  - [ ] CORS headers configured
  - [ ] Secrets configured
  - [ ] Auth validation added

storage_checklist:
  - [ ] Buckets created
  - [ ] Policies cover upload/download
  - [ ] File size limits set
  - [ ] Content type restrictions (if needed)
```

### 9. Deploy All

```bash
# Deploy everything
supabase db push
supabase functions deploy

# Or run all commands
./scripts/deploy.sh
```

Create deploy script:
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Deploying to Supabase..."

# Push database migrations
echo "Pushing database migrations..."
supabase db push

# Deploy functions
echo "Deploying Edge Functions..."
supabase functions deploy

# Generate types
echo "Generating types..."
supabase gen types dart --linked > lib/src/database.types.dart

echo "Deployment complete!"
```

### 10. Verify Deployment

```bash
# Check database status
supabase db diff

# Test function
curl -X POST 'https://{{project_ref}}.supabase.co/functions/v1/my-function' \
  -H "Authorization: Bearer {{anon_key}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Check function logs
supabase functions logs my-function
```

### 11. Output Summary

```
Supabase Deployment Complete
============================

Project: {{project_ref}}
URL: https://{{project_ref}}.supabase.co

Database:
- Migrations applied: 5
- Tables: 8
- RLS policies: 24

Edge Functions:
- Deployed: 3
  - hello-world
  - process-order
  - send-notification

Storage:
- Buckets: 3
  - public (public)
  - private (private)
  - avatars (public)

Realtime:
- Enabled tables: products, orders

Next Steps:
1. Test endpoints in Supabase Dashboard
2. Verify RLS policies work as expected
3. Monitor function logs for errors
```

## Rollback

```bash
# Create rollback migration
supabase migration new rollback_{{feature}}

# Revert function to previous version
# (redeploy from git history)
git checkout HEAD~1 -- supabase/functions/my-function
supabase functions deploy my-function
```

## Agent Reference

For Supabase services, consult:
- `flutter-supabase-core` - Core setup
- `flutter-supabase-database` - Database patterns
- `flutter-supabase-services` - Storage, Functions
