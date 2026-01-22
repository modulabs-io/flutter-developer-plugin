# /flutter-firebase-deploy

Deploy Firebase security rules, Cloud Functions, and hosting.

## Usage

```
/flutter-firebase-deploy [target] [options]
```

## Targets

- `rules`: Deploy Firestore and Storage security rules
- `functions`: Deploy Cloud Functions
- `hosting`: Deploy web app to Firebase Hosting
- `all`: Deploy everything

## Options

- `--only <services>`: Deploy specific services
- `--project <id>`: Target specific Firebase project
- `--dry-run`: Preview deployment without applying

## Examples

```
/flutter-firebase-deploy rules
/flutter-firebase-deploy functions
/flutter-firebase-deploy hosting
/flutter-firebase-deploy all
/flutter-firebase-deploy --only firestore:rules,storage
```

## Instructions

When the user invokes `/flutter-firebase-deploy`, follow these steps:

### 1. Verify Firebase CLI

```bash
# Check Firebase CLI
firebase --version

# Login if needed
firebase login

# Check current project
firebase projects:list
firebase use
```

### 2. Deploy Security Rules

#### Firestore Rules

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Preview rules
firebase firestore:rules:print
```

Create/verify `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users
    function isAuth() {
      return request.auth != null;
    }

    // User owns document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Admin check
    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuth() && (isOwner(userId) || isAdmin());
      allow create: if isAuth() && isOwner(userId);
      allow update: if isAuth() && isOwner(userId);
      allow delete: if isAdmin();

      // User's private subcollections
      match /{subcollection}/{docId} {
        allow read, write: if isAuth() && isOwner(userId);
      }
    }

    // Public read collections
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders (user can read own, admins can read all)
    match /orders/{orderId} {
      allow read: if isAuth() &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuth() &&
        request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

#### Storage Rules

```bash
# Deploy Storage rules only
firebase deploy --only storage
```

Create/verify `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User files
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Public files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Uploads with size limit
    match /uploads/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024  // 10MB
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 3. Deploy Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

Create/verify `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 4. Deploy Cloud Functions

```bash
# Initialize functions if not exists
firebase init functions

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:myFunction

# Deploy function group
firebase deploy --only functions:api
```

Example function (`functions/src/index.ts`):
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// HTTP function
export const api = functions.https.onRequest((req, res) => {
  res.json({ message: 'Hello from Firebase!' });
});

// Callable function
export const createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { email, name } = data;
  // Create user logic
  return { success: true };
});

// Firestore trigger
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    // Send welcome email, etc.
  });

// Scheduled function
export const dailyCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Cleanup logic
  });
```

### 5. Deploy Web Hosting

```bash
# Build Flutter web
flutter build web --release

# Initialize hosting if not exists
firebase init hosting
# Set public directory to: build/web

# Deploy
firebase deploy --only hosting

# Deploy to preview channel
firebase hosting:channel:deploy preview
```

`firebase.json` configuration:
```json
{
  "hosting": {
    "public": "build/web",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 6. Deploy All

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore,storage,functions,hosting

# Deploy to specific project
firebase deploy --project my-app-prod
```

### 7. Environment-Specific Deployment

```bash
# Development
firebase use development
firebase deploy

# Production
firebase use production
firebase deploy

# Or use --project flag
firebase deploy --project my-app-dev
firebase deploy --project my-app-prod
```

### 8. Pre-Deployment Checklist

```yaml
rules_checklist:
  - [ ] Test rules with Firebase Emulator
  - [ ] Verify authentication requirements
  - [ ] Check data validation rules
  - [ ] Review admin-only operations
  - [ ] Test edge cases

functions_checklist:
  - [ ] Run local tests
  - [ ] Check environment variables
  - [ ] Verify IAM permissions
  - [ ] Review memory/timeout settings
  - [ ] Check cold start optimization

hosting_checklist:
  - [ ] Build in release mode
  - [ ] Verify base href for routing
  - [ ] Check asset paths
  - [ ] Test SPA routing
  - [ ] Verify CORS settings
```

### 9. Rollback (if needed)

```bash
# List releases
firebase hosting:releases:list

# Rollback to previous release
firebase hosting:rollback

# Functions - redeploy previous version
firebase deploy --only functions:functionName
```

### 10. Output Summary

```
Firebase Deployment Complete
============================

Project: {{project_id}}
Environment: {{environment}}

Deployed Services:
✓ Firestore Rules
✓ Firestore Indexes
✓ Storage Rules
✓ Cloud Functions (3 functions)
✓ Hosting

URLs:
- Hosting: https://{{project_id}}.web.app
- Functions: https://{{region}}-{{project_id}}.cloudfunctions.net/api

Deployment ID: {{deployment_id}}
Timestamp: {{timestamp}}

Verification Commands:
- Test rules: firebase emulators:start
- View logs: firebase functions:log
- Check hosting: firebase hosting:sites:list
```

## Troubleshooting

```yaml
common_issues:
  - issue: "Permission denied during deploy"
    fix: "Run `firebase login` or check project permissions"

  - issue: "Function deployment timeout"
    fix: "Increase timeout in firebase.json or reduce function size"

  - issue: "Rules syntax error"
    fix: "Test with `firebase emulators:start` first"

  - issue: "Hosting 404 errors"
    fix: "Check rewrite rules for SPA routing"
```

## Agent Reference

For Firebase service patterns, consult:
- `flutter-firebase-core` - Core setup
- `flutter-firebase-firestore` - Database rules
- `flutter-firebase-services` - Storage, Functions
