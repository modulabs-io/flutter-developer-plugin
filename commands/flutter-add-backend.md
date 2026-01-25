---
name: flutter-add-backend
description: Add and configure a backend service (Firebase or Supabase) with multiple services in a single cohesive setup
arguments:
  - name: backend
    description: Backend provider to configure
    required: true
    type: choice
    options: [firebase, supabase]
  - name: services
    description: Comma-separated list of services to enable (auth, database, storage, functions, messaging, analytics)
    type: string
    default: auth,database
  - name: flavor
    description: Configure for specific environment/flavor
    type: choice
    options: [development, staging, production, all]
    default: all
  - name: emulators
    description: Set up local emulator configuration (Firebase only)
    type: boolean
    default: true
  - name: offline
    description: Enable offline persistence support
    type: boolean
    default: true
agents:
  - flutter-firebase-core
  - flutter-firebase-auth
  - flutter-firebase-firestore
  - flutter-firebase-services
  - flutter-supabase-core
  - flutter-supabase-auth
  - flutter-supabase-database
  - flutter-supabase-services
---

# Flutter Add Backend Command

Add and configure a complete backend service (Firebase or Supabase) with multiple services in a single cohesive setup. This command orchestrates individual service initialization into a unified configuration.

## Usage

```
/flutter-add-backend <backend> [options]
```

## Options

- `--services <list>`: Services to enable (auth, database, storage, functions, messaging, analytics)
- `--flavor <env>`: Environment to configure (development, staging, production, all)
- `--emulators`: Set up local emulator config (Firebase only)
- `--offline`: Enable offline persistence

## Available Services

| Service | Firebase | Supabase | Description |
|---------|----------|----------|-------------|
| auth | Firebase Auth | Supabase Auth | User authentication |
| database | Firestore | PostgreSQL | Data storage |
| storage | Cloud Storage | Supabase Storage | File storage |
| functions | Cloud Functions | Edge Functions | Serverless functions |
| messaging | FCM | - | Push notifications |
| analytics | Google Analytics | - | App analytics |

## Examples

```
/flutter-add-backend firebase --services auth,database,storage
/flutter-add-backend supabase --services auth,database --flavor development
/flutter-add-backend firebase --services auth,database,messaging,analytics --emulators
/flutter-add-backend supabase --services auth,database,storage,functions --offline
```

## Firebase Setup

### Generated Structure

```
lib/
├── core/
│   └── services/
│       ├── firebase/
│       │   ├── firebase_service.dart
│       │   ├── firebase_options_dev.dart
│       │   ├── firebase_options_staging.dart
│       │   └── firebase_options_prod.dart
│       ├── auth/
│       │   └── firebase_auth_service.dart
│       ├── database/
│       │   └── firestore_service.dart
│       ├── storage/
│       │   └── firebase_storage_service.dart
│       └── messaging/
│           └── fcm_service.dart
```

### Firebase Initialization

```dart
// lib/core/services/firebase/firebase_service.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options_dev.dart' as dev;
import 'firebase_options_staging.dart' as staging;
import 'firebase_options_prod.dart' as prod;

enum AppEnvironment { development, staging, production }

class FirebaseService {
  static AppEnvironment _environment = AppEnvironment.development;

  static AppEnvironment get environment => _environment;

  static Future<void> initialize({
    required AppEnvironment environment,
    bool useEmulators = false,
  }) async {
    _environment = environment;

    final options = switch (environment) {
      AppEnvironment.development => dev.DefaultFirebaseOptions.currentPlatform,
      AppEnvironment.staging => staging.DefaultFirebaseOptions.currentPlatform,
      AppEnvironment.production => prod.DefaultFirebaseOptions.currentPlatform,
    };

    await Firebase.initializeApp(options: options);

    if (useEmulators && kDebugMode) {
      await _connectToEmulators();
    }
  }

  static Future<void> _connectToEmulators() async {
    const host = 'localhost';

    // Auth emulator
    await FirebaseAuth.instance.useAuthEmulator(host, 9099);

    // Firestore emulator
    FirebaseFirestore.instance.useFirestoreEmulator(host, 8080);

    // Storage emulator
    await FirebaseStorage.instance.useStorageEmulator(host, 9199);

    // Functions emulator
    FirebaseFunctions.instance.useFunctionsEmulator(host, 5001);
  }
}
```

### Firestore Service

```dart
// lib/core/services/database/firestore_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _firestore;

  FirestoreService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  // Enable offline persistence
  static Future<void> enablePersistence() async {
    FirebaseFirestore.instance.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );
  }

  // Generic CRUD operations
  CollectionReference<Map<String, dynamic>> collection(String path) {
    return _firestore.collection(path);
  }

  Future<DocumentReference<Map<String, dynamic>>> add(
    String collection,
    Map<String, dynamic> data,
  ) async {
    return _firestore.collection(collection).add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> set(
    String collection,
    String docId,
    Map<String, dynamic> data, {
    bool merge = true,
  }) async {
    await _firestore.collection(collection).doc(docId).set(
      {
        ...data,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: merge),
    );
  }

  Future<void> update(
    String collection,
    String docId,
    Map<String, dynamic> data,
  ) async {
    await _firestore.collection(collection).doc(docId).update({
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> delete(String collection, String docId) async {
    await _firestore.collection(collection).doc(docId).delete();
  }

  Future<DocumentSnapshot<Map<String, dynamic>>> get(
    String collection,
    String docId,
  ) async {
    return _firestore.collection(collection).doc(docId).get();
  }

  Stream<DocumentSnapshot<Map<String, dynamic>>> stream(
    String collection,
    String docId,
  ) {
    return _firestore.collection(collection).doc(docId).snapshots();
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> streamCollection(
    String collection, {
    List<List<dynamic>>? where,
    String? orderBy,
    bool descending = false,
    int? limit,
  }) {
    Query<Map<String, dynamic>> query = _firestore.collection(collection);

    if (where != null) {
      for (final condition in where) {
        query = query.where(condition[0], isEqualTo: condition[1]);
      }
    }

    if (orderBy != null) {
      query = query.orderBy(orderBy, descending: descending);
    }

    if (limit != null) {
      query = query.limit(limit);
    }

    return query.snapshots();
  }
}
```

### Firebase Storage Service

```dart
// lib/core/services/storage/firebase_storage_service.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:firebase_storage/firebase_storage.dart';

class FirebaseStorageService {
  final FirebaseStorage _storage;

  FirebaseStorageService({FirebaseStorage? storage})
      : _storage = storage ?? FirebaseStorage.instance;

  Reference ref(String path) => _storage.ref(path);

  Future<String> uploadFile(
    String path,
    File file, {
    Map<String, String>? metadata,
  }) async {
    final ref = _storage.ref(path);
    final uploadTask = ref.putFile(
      file,
      metadata != null ? SettableMetadata(customMetadata: metadata) : null,
    );

    final snapshot = await uploadTask;
    return snapshot.ref.getDownloadURL();
  }

  Future<String> uploadBytes(
    String path,
    Uint8List bytes, {
    String? contentType,
    Map<String, String>? metadata,
  }) async {
    final ref = _storage.ref(path);
    final uploadTask = ref.putData(
      bytes,
      SettableMetadata(
        contentType: contentType,
        customMetadata: metadata,
      ),
    );

    final snapshot = await uploadTask;
    return snapshot.ref.getDownloadURL();
  }

  Future<void> delete(String path) async {
    await _storage.ref(path).delete();
  }

  Future<String> getDownloadUrl(String path) async {
    return _storage.ref(path).getDownloadURL();
  }

  Stream<TaskSnapshot> uploadWithProgress(String path, File file) {
    return _storage.ref(path).putFile(file).snapshotEvents;
  }
}
```

### FCM Service

```dart
// lib/core/services/messaging/fcm_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FCMService {
  final FirebaseMessaging _messaging;
  final FlutterLocalNotificationsPlugin _localNotifications;

  FCMService({
    FirebaseMessaging? messaging,
    FlutterLocalNotificationsPlugin? localNotifications,
  })  : _messaging = messaging ?? FirebaseMessaging.instance,
        _localNotifications =
            localNotifications ?? FlutterLocalNotificationsPlugin();

  Future<void> initialize({
    required void Function(RemoteMessage) onMessageOpenedApp,
    void Function(String?)? onTokenRefresh,
  }) async {
    // Request permission
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background/terminated state messages
    FirebaseMessaging.onMessageOpenedApp.listen(onMessageOpenedApp);

    // Check for initial message (app opened from terminated state)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      onMessageOpenedApp(initialMessage);
    }

    // Token refresh
    _messaging.onTokenRefresh.listen(onTokenRefresh);
  }

  Future<String?> getToken() async {
    return _messaging.getToken();
  }

  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }

  Future<void> _initializeLocalNotifications() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings();

    await _localNotifications.initialize(
      const InitializationSettings(android: android, iOS: ios),
    );
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'default_channel',
          'Default',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}
```

## Supabase Setup

### Generated Structure

```
lib/
├── core/
│   └── services/
│       ├── supabase/
│       │   ├── supabase_service.dart
│       │   └── supabase_config.dart
│       ├── auth/
│       │   └── supabase_auth_service.dart
│       ├── database/
│       │   └── supabase_database_service.dart
│       └── storage/
│           └── supabase_storage_service.dart
```

### Supabase Initialization

```dart
// lib/core/services/supabase/supabase_service.dart
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_config.dart';

enum AppEnvironment { development, staging, production }

class SupabaseService {
  static late AppEnvironment _environment;
  static late SupabaseClient _client;

  static AppEnvironment get environment => _environment;
  static SupabaseClient get client => _client;

  static Future<void> initialize({
    required AppEnvironment environment,
  }) async {
    _environment = environment;

    final config = switch (environment) {
      AppEnvironment.development => SupabaseConfig.development,
      AppEnvironment.staging => SupabaseConfig.staging,
      AppEnvironment.production => SupabaseConfig.production,
    };

    await Supabase.initialize(
      url: config.url,
      anonKey: config.anonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        eventsPerSecond: 2,
      ),
    );

    _client = Supabase.instance.client;
  }
}
```

### Supabase Config

```dart
// lib/core/services/supabase/supabase_config.dart
class SupabaseConfig {
  final String url;
  final String anonKey;

  const SupabaseConfig({
    required this.url,
    required this.anonKey,
  });

  static const development = SupabaseConfig(
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_ANON_KEY',
  );

  static const staging = SupabaseConfig(
    url: 'https://YOUR_STAGING_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_STAGING_ANON_KEY',
  );

  static const production = SupabaseConfig(
    url: 'https://YOUR_PROD_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_PROD_ANON_KEY',
  );
}
```

### Supabase Database Service

```dart
// lib/core/services/database/supabase_database_service.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseDatabaseService {
  final SupabaseClient _client;

  SupabaseDatabaseService({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  // Table reference
  SupabaseQueryBuilder from(String table) => _client.from(table);

  // Generic CRUD operations
  Future<List<Map<String, dynamic>>> getAll(
    String table, {
    String? orderBy,
    bool ascending = true,
    int? limit,
    int? offset,
  }) async {
    var query = _client.from(table).select();

    if (orderBy != null) {
      query = query.order(orderBy, ascending: ascending);
    }

    if (limit != null) {
      query = query.limit(limit);
    }

    if (offset != null) {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }

    return await query;
  }

  Future<Map<String, dynamic>?> getById(String table, String id) async {
    final result = await _client.from(table).select().eq('id', id).maybeSingle();
    return result;
  }

  Future<Map<String, dynamic>> insert(
    String table,
    Map<String, dynamic> data,
  ) async {
    final result = await _client
        .from(table)
        .insert({
          ...data,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        })
        .select()
        .single();
    return result;
  }

  Future<Map<String, dynamic>> update(
    String table,
    String id,
    Map<String, dynamic> data,
  ) async {
    final result = await _client
        .from(table)
        .update({
          ...data,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', id)
        .select()
        .single();
    return result;
  }

  Future<void> delete(String table, String id) async {
    await _client.from(table).delete().eq('id', id);
  }

  // Real-time subscriptions
  RealtimeChannel subscribe(
    String table, {
    required void Function(Map<String, dynamic>) onInsert,
    void Function(Map<String, dynamic>)? onUpdate,
    void Function(Map<String, dynamic>)? onDelete,
  }) {
    return _client
        .channel('public:$table')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: table,
          callback: (payload) => onInsert(payload.newRecord),
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: table,
          callback: (payload) => onUpdate?.call(payload.newRecord),
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.delete,
          schema: 'public',
          table: table,
          callback: (payload) => onDelete?.call(payload.oldRecord),
        )
        .subscribe();
  }

  void unsubscribe(RealtimeChannel channel) {
    _client.removeChannel(channel);
  }
}
```

### Supabase Storage Service

```dart
// lib/core/services/storage/supabase_storage_service.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseStorageService {
  final SupabaseClient _client;

  SupabaseStorageService({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  StorageFileApi bucket(String name) => _client.storage.from(name);

  Future<String> uploadFile(
    String bucket,
    String path,
    File file, {
    FileOptions? options,
  }) async {
    await _client.storage.from(bucket).upload(
      path,
      file,
      fileOptions: options ?? const FileOptions(upsert: true),
    );
    return getPublicUrl(bucket, path);
  }

  Future<String> uploadBytes(
    String bucket,
    String path,
    Uint8List bytes, {
    FileOptions? options,
  }) async {
    await _client.storage.from(bucket).uploadBinary(
      path,
      bytes,
      fileOptions: options ?? const FileOptions(upsert: true),
    );
    return getPublicUrl(bucket, path);
  }

  Future<void> delete(String bucket, List<String> paths) async {
    await _client.storage.from(bucket).remove(paths);
  }

  String getPublicUrl(String bucket, String path) {
    return _client.storage.from(bucket).getPublicUrl(path);
  }

  Future<String> createSignedUrl(
    String bucket,
    String path, {
    int expiresIn = 3600,
  }) async {
    return _client.storage.from(bucket).createSignedUrl(path, expiresIn);
  }

  Future<List<FileObject>> list(String bucket, {String? path}) async {
    return _client.storage.from(bucket).list(path: path);
  }
}
```

## Riverpod Provider Setup

```dart
// lib/core/providers/backend_providers.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'backend_providers.g.dart';

// Firebase providers
@Riverpod(keepAlive: true)
FirestoreService firestoreService(FirestoreServiceRef ref) {
  return FirestoreService();
}

@Riverpod(keepAlive: true)
FirebaseStorageService firebaseStorageService(FirebaseStorageServiceRef ref) {
  return FirebaseStorageService();
}

@Riverpod(keepAlive: true)
FCMService fcmService(FCMServiceRef ref) {
  return FCMService();
}

// Supabase providers
@Riverpod(keepAlive: true)
SupabaseDatabaseService supabaseDatabaseService(SupabaseDatabaseServiceRef ref) {
  return SupabaseDatabaseService();
}

@Riverpod(keepAlive: true)
SupabaseStorageService supabaseStorageService(SupabaseStorageServiceRef ref) {
  return SupabaseStorageService();
}
```

## Required Dependencies

### Firebase

```yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0          # if auth
  cloud_firestore: ^5.0.0        # if database
  firebase_storage: ^12.0.0      # if storage
  cloud_functions: ^5.0.0        # if functions
  firebase_messaging: ^15.0.0    # if messaging
  firebase_analytics: ^11.0.0    # if analytics
  flutter_local_notifications: ^17.0.0  # for FCM foreground
```

### Supabase

```yaml
dependencies:
  supabase_flutter: ^2.5.0
```

## Execution Steps

When `/flutter-add-backend` is invoked:

1. Parse backend and options
2. Check for existing backend setup (warn if exists)
3. Add required dependencies to pubspec.yaml
4. Generate service directory structure
5. Generate initialization service
6. Generate individual service classes
7. Generate Riverpod providers
8. Update main.dart with initialization
9. Generate environment-specific configs
10. Set up emulators config (Firebase)
11. Output setup instructions

## Output Summary

```
Backend Setup Complete
======================

Backend: Firebase
Environment: all
Services: auth, database, storage, messaging

Files Created:
Core Services:
  - lib/core/services/firebase/firebase_service.dart
  - lib/core/services/firebase/firebase_options_dev.dart
  - lib/core/services/firebase/firebase_options_staging.dart
  - lib/core/services/firebase/firebase_options_prod.dart

Service Classes:
  - lib/core/services/auth/firebase_auth_service.dart
  - lib/core/services/database/firestore_service.dart
  - lib/core/services/storage/firebase_storage_service.dart
  - lib/core/services/messaging/fcm_service.dart

Providers:
  - lib/core/providers/backend_providers.dart

Dependencies Added:
  - firebase_core: ^3.0.0
  - firebase_auth: ^5.0.0
  - cloud_firestore: ^5.0.0
  - firebase_storage: ^12.0.0
  - firebase_messaging: ^15.0.0

Next Steps:
1. Run: flutter pub get
2. Run: flutterfire configure (for each environment)
3. Copy generated options to firebase_options_*.dart
4. Update main.dart initialization
5. For emulators: firebase emulators:start
6. Run: dart run build_runner build
```

## Related Skills

For individual service setup, use these dedicated skills:

- **Firebase Init**: `/flutter-firebase-init` for basic Firebase setup
- **Firebase Auth**: `/flutter-firebase-auth` for detailed auth configuration
- **Firebase Firestore**: `/flutter-firebase-firestore` for Firestore rules and indexes
- **Supabase Init**: `/flutter-supabase-init` for basic Supabase setup
- **Supabase Auth**: `/flutter-supabase-auth` for detailed auth configuration
- **Supabase Database**: `/flutter-supabase-database` for RLS policies

## Validation

The command validates the following before execution:

- **No existing backend**: Warns if backend services already configured
- **Valid services**: Validates service names for chosen backend
- **Flutter project**: Confirms valid Flutter project structure

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Backend already configured | Services directory exists | Remove existing or use specific service skill |
| Invalid service | Service not available for backend | Check available services per backend |
| FlutterFire not installed | Firebase CLI tools missing | Run: `dart pub global activate flutterfire_cli` |
| Supabase project not found | Invalid project configuration | Verify Supabase project URL and keys |

## Agent Reference

For backend-specific guidance:

- **Firebase Core**: Consult `flutter-firebase-core` agent for Firebase project setup, FlutterFire CLI, and multi-environment configuration
- **Firebase Services**: Consult `flutter-firebase-services` agent for Cloud Functions, Messaging, Analytics, and Remote Config
- **Firestore**: Consult `flutter-firebase-firestore` agent for security rules, indexes, and data modeling
- **Supabase Core**: Consult `flutter-supabase-core` agent for project setup, client configuration, and environment management
- **Supabase Database**: Consult `flutter-supabase-database` agent for RLS policies, migrations, and real-time subscriptions
