# /flutter-supabase-db

Set up Supabase database with models, repositories, and RLS policies.

## Usage

```
/flutter-supabase-db [options]
```

## Options

- `--table <name>`: Create repository for specific table
- `--model <name>`: Generate model class
- `--migration <name>`: Create new migration
- `--rls`: Generate RLS policy templates

## Examples

```
/flutter-supabase-db
/flutter-supabase-db --table products
/flutter-supabase-db --migration create_products
/flutter-supabase-db --rls
```

## Instructions

When the user invokes `/flutter-supabase-db`, follow these steps:

### 1. Create Migration

```bash
# Create new migration
supabase migration new {{migration_name}}

# This creates: supabase/migrations/{{timestamp}}_{{migration_name}}.sql
```

### 2. Write Migration SQL

```sql
-- supabase/migrations/{{timestamp}}_create_{{table}}.sql

-- Create table
CREATE TABLE {{table}} (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_{{table}}_user_id ON {{table}}(user_id);
CREATE INDEX idx_{{table}}_created_at ON {{table}}(created_at DESC);

-- Enable RLS
ALTER TABLE {{table}} ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own {{table}}"
ON {{table}} FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own {{table}}"
ON {{table}} FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own {{table}}"
ON {{table}} FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own {{table}}"
ON {{table}} FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {{table}}_updated_at
BEFORE UPDATE ON {{table}}
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3. Apply Migration

```bash
# Apply locally
supabase db reset

# Push to remote
supabase db push

# Or via SQL editor in Dashboard
```

### 4. Generate Types

```bash
# Generate Dart types
supabase gen types dart --local > lib/src/database.types.dart
```

### 5. Create Model

```dart
// lib/features/{{table}}/domain/entities/{{model}}.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part '{{model}}.freezed.dart';
part '{{model}}.g.dart';

@freezed
class {{Model}} with _${{Model}} {
  const factory {{Model}}({
    required String id,
    required String name,
    String? description,
    @Default(true) bool isActive,
    required DateTime createdAt,
    DateTime? updatedAt,
    required String userId,
  }) = _{{Model}};

  const {{Model}}._();

  factory {{Model}}.fromJson(Map<String, dynamic> json) =>
      _${{Model}}FromJson(json);

  Map<String, dynamic> toInsert() => {
    'name': name,
    'description': description,
    'is_active': isActive,
    'user_id': userId,
  };

  Map<String, dynamic> toUpdate() => {
    'name': name,
    'description': description,
    'is_active': isActive,
  };
}
```

### 6. Create Repository

```dart
// lib/features/{{table}}/data/repositories/{{table}}_repository.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/entities/{{model}}.dart';

class {{Table}}Repository {
  final SupabaseClient _client;
  static const _tableName = '{{table}}';

  {{Table}}Repository({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  SupabaseQueryBuilder get _table => _client.from(_tableName);

  // Create
  Future<{{Model}}> create({{Model}} item) async {
    final response = await _table
        .insert(item.toInsert())
        .select()
        .single();
    return {{Model}}.fromJson(response);
  }

  // Read
  Future<{{Model}}?> getById(String id) async {
    final response = await _table
        .select()
        .eq('id', id)
        .maybeSingle();
    return response != null ? {{Model}}.fromJson(response) : null;
  }

  Future<List<{{Model}}>> getAll() async {
    final response = await _table
        .select()
        .order('created_at', ascending: false);
    return response.map((e) => {{Model}}.fromJson(e)).toList();
  }

  Future<List<{{Model}}>> getByUserId(String userId) async {
    final response = await _table
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return response.map((e) => {{Model}}.fromJson(e)).toList();
  }

  // Update
  Future<{{Model}}> update(String id, {{Model}} item) async {
    final response = await _table
        .update(item.toUpdate())
        .eq('id', id)
        .select()
        .single();
    return {{Model}}.fromJson(response);
  }

  // Delete
  Future<void> delete(String id) async {
    await _table.delete().eq('id', id);
  }

  // Real-time stream
  Stream<List<{{Model}}>> watchAll() {
    return _table
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .map((data) => data.map((e) => {{Model}}.fromJson(e)).toList());
  }

  Stream<{{Model}}?> watchById(String id) {
    return _table
        .stream(primaryKey: ['id'])
        .eq('id', id)
        .map((data) => data.isEmpty ? null : {{Model}}.fromJson(data.first));
  }
}
```

### 7. Create Provider (Riverpod)

```dart
// lib/features/{{table}}/presentation/providers/{{table}}_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/{{table}}_repository.dart';
import '../../domain/entities/{{model}}.dart';

part '{{table}}_provider.g.dart';

@riverpod
{{Table}}Repository {{table}}Repository({{Table}}RepositoryRef ref) {
  return {{Table}}Repository();
}

@riverpod
Stream<List<{{Model}}>> {{table}}Stream({{Table}}StreamRef ref) {
  return ref.watch({{table}}RepositoryProvider).watchAll();
}

@riverpod
Stream<{{Model}}?> {{model}}Stream({{Model}}StreamRef ref, String id) {
  return ref.watch({{table}}RepositoryProvider).watchById(id);
}

@riverpod
class {{Table}}Notifier extends _${{Table}}Notifier {
  @override
  Future<List<{{Model}}>> build() async {
    return ref.watch({{table}}RepositoryProvider).getAll();
  }

  Future<void> create({{Model}} item) async {
    await ref.read({{table}}RepositoryProvider).create(item);
    ref.invalidateSelf();
  }

  Future<void> update(String id, {{Model}} item) async {
    await ref.read({{table}}RepositoryProvider).update(id, item);
    ref.invalidateSelf();
  }

  Future<void> delete(String id) async {
    await ref.read({{table}}RepositoryProvider).delete(id);
    ref.invalidateSelf();
  }
}
```

### 8. Common RLS Patterns (--rls)

```sql
-- Pattern 1: User owns data
CREATE POLICY "owner_policy" ON {{table}}
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pattern 2: Public read, authenticated write
CREATE POLICY "public_read" ON {{table}}
FOR SELECT USING (true);

CREATE POLICY "auth_write" ON {{table}}
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Pattern 3: Organization-based
CREATE POLICY "org_access" ON {{table}}
FOR ALL TO authenticated
USING (
  org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid()
  )
);

-- Pattern 4: Role-based
CREATE POLICY "admin_only" ON {{table}}
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 9. Run Code Generation

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 10. Output Summary

```
Supabase Database Setup Complete
================================

Table: {{table}}
Model: {{Model}}

Files Created:
- supabase/migrations/{{timestamp}}_create_{{table}}.sql
- lib/features/{{table}}/domain/entities/{{model}}.dart
- lib/features/{{table}}/data/repositories/{{table}}_repository.dart
- lib/features/{{table}}/presentation/providers/{{table}}_provider.dart

RLS Policies:
- Users can view own data ✓
- Users can insert own data ✓
- Users can update own data ✓
- Users can delete own data ✓

Next Steps:
1. Run `supabase db reset` (local) or `supabase db push` (remote)
2. Run `dart run build_runner build`
3. Test CRUD operations
```

## Agent Reference

For database patterns, consult the `flutter-supabase-database` agent.
