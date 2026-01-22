# /flutter-firebase-db

Set up Cloud Firestore database with models, repositories, and security rules.

## Usage

```
/flutter-firebase-db [options]
```

## Options

- `--collection <name>`: Create repository for specific collection
- `--model <name>`: Generate model class
- `--rules`: Generate security rules template
- `--indexes`: Generate composite indexes

## Examples

```
/flutter-firebase-db
/flutter-firebase-db --collection users
/flutter-firebase-db --model Product --collection products
/flutter-firebase-db --rules
```

## Instructions

When the user invokes `/flutter-firebase-db`, follow these steps:

### 1. Add Dependencies

```bash
flutter pub add cloud_firestore
flutter pub add freezed_annotation
flutter pub add --dev freezed build_runner json_serializable
```

```yaml
# pubspec.yaml
dependencies:
  cloud_firestore: ^4.15.8
  freezed_annotation: ^2.4.1

dev_dependencies:
  freezed: ^2.4.7
  build_runner: ^2.4.9
  json_serializable: ^6.7.1
```

### 2. Create Base Repository

```dart
// lib/core/firebase/firestore_repository.dart
import 'package:cloud_firestore/cloud_firestore.dart';

abstract class FirestoreRepository<T> {
  final FirebaseFirestore firestore;
  final String collectionPath;
  final T Function(DocumentSnapshot<Map<String, dynamic>>) fromFirestore;
  final Map<String, dynamic> Function(T) toFirestore;

  FirestoreRepository({
    required this.collectionPath,
    required this.fromFirestore,
    required this.toFirestore,
    FirebaseFirestore? firestore,
  }) : firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get collection =>
      firestore.collection(collectionPath);

  // Create
  Future<String> create(T item) async {
    final docRef = await collection.add(toFirestore(item));
    return docRef.id;
  }

  Future<void> createWithId(String id, T item) async {
    await collection.doc(id).set(toFirestore(item));
  }

  // Read
  Future<T?> getById(String id) async {
    final doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return fromFirestore(doc);
  }

  Future<List<T>> getAll() async {
    final snapshot = await collection.get();
    return snapshot.docs.map(fromFirestore).toList();
  }

  // Update
  Future<void> update(String id, T item) async {
    await collection.doc(id).update(toFirestore(item));
  }

  Future<void> updateFields(String id, Map<String, dynamic> fields) async {
    await collection.doc(id).update(fields);
  }

  // Delete
  Future<void> delete(String id) async {
    await collection.doc(id).delete();
  }

  // Stream
  Stream<T?> watchById(String id) {
    return collection.doc(id).snapshots().map((doc) {
      if (!doc.exists) return null;
      return fromFirestore(doc);
    });
  }

  Stream<List<T>> watchAll() {
    return collection.snapshots().map(
      (snapshot) => snapshot.docs.map(fromFirestore).toList(),
    );
  }
}
```

### 3. Create Model with Freezed

```dart
// lib/features/{{collection}}/domain/entities/{{model}}.dart
import 'package:cloud_firestore/cloud_firestore.dart';
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
  }) = _{{Model}};

  const {{Model}}._();

  factory {{Model}}.fromFirestore(
    DocumentSnapshot<Map<String, dynamic>> doc,
  ) {
    final data = doc.data()!;
    return {{Model}}(
      id: doc.id,
      name: data['name'] as String,
      description: data['description'] as String?,
      isActive: data['isActive'] as bool? ?? true,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'description': description,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
      if (updatedAt != null) 'updatedAt': Timestamp.fromDate(updatedAt!),
    };
  }

  factory {{Model}}.fromJson(Map<String, dynamic> json) =>
      _${{Model}}FromJson(json);
}
```

### 4. Create Collection Repository

```dart
// lib/features/{{collection}}/data/repositories/{{collection}}_repository.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_repository.dart';
import '../../domain/entities/{{model}}.dart';

class {{Collection}}Repository extends FirestoreRepository<{{Model}}> {
  {{Collection}}Repository({super.firestore})
      : super(
          collectionPath: '{{collection}}',
          fromFirestore: {{Model}}.fromFirestore,
          toFirestore: (item) => item.toFirestore(),
        );

  // Custom queries
  Future<List<{{Model}}>> getActive() async {
    final snapshot = await collection
        .where('isActive', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map(fromFirestore).toList();
  }

  Stream<List<{{Model}}>> watchActive() {
    return collection
        .where('isActive', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map(fromFirestore).toList());
  }

  // Pagination
  Future<List<{{Model}}>> getPage({
    int limit = 20,
    DocumentSnapshot? startAfter,
  }) async {
    Query<Map<String, dynamic>> query = collection
        .orderBy('createdAt', descending: true)
        .limit(limit);

    if (startAfter != null) {
      query = query.startAfterDocument(startAfter);
    }

    final snapshot = await query.get();
    return snapshot.docs.map(fromFirestore).toList();
  }

  // Search
  Future<List<{{Model}}>> search(String query) async {
    // Note: Firestore doesn't support full-text search
    // Consider using Algolia or similar for production
    final snapshot = await collection
        .where('name', isGreaterThanOrEqualTo: query)
        .where('name', isLessThanOrEqualTo: '$query\uf8ff')
        .get();
    return snapshot.docs.map(fromFirestore).toList();
  }
}
```

### 5. Create Provider (Riverpod)

```dart
// lib/features/{{collection}}/presentation/providers/{{collection}}_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/{{collection}}_repository.dart';
import '../../domain/entities/{{model}}.dart';

part '{{collection}}_provider.g.dart';

@riverpod
{{Collection}}Repository {{collection}}Repository({{Collection}}RepositoryRef ref) {
  return {{Collection}}Repository();
}

@riverpod
Stream<List<{{Model}}>> {{collection}}Stream({{Collection}}StreamRef ref) {
  return ref.watch({{collection}}RepositoryProvider).watchActive();
}

@riverpod
Future<{{Model}}?> {{model}}({{Model}}Ref ref, String id) {
  return ref.watch({{collection}}RepositoryProvider).getById(id);
}

@riverpod
class {{Collection}}Notifier extends _${{Collection}}Notifier {
  @override
  Future<List<{{Model}}>> build() async {
    return ref.watch({{collection}}RepositoryProvider).getActive();
  }

  Future<void> add({{Model}} item) async {
    await ref.read({{collection}}RepositoryProvider).create(item);
    ref.invalidateSelf();
  }

  Future<void> update({{Model}} item) async {
    await ref.read({{collection}}RepositoryProvider).update(item.id, item);
    ref.invalidateSelf();
  }

  Future<void> delete(String id) async {
    await ref.read({{collection}}RepositoryProvider).delete(id);
    ref.invalidateSelf();
  }
}
```

### 6. Generate Security Rules (--rules)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return request.auth.token.admin == true;
    }

    function isValidString(field, minLen, maxLen) {
      return field is string
        && field.size() >= minLen
        && field.size() <= maxLen;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAdmin();
    }

    // {{Collection}} collection
    match /{{collection}}/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated()
        && isValidString(request.resource.data.name, 1, 100);
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 7. Generate Composite Indexes (--indexes)

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "{{collection}}",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "{{collection}}",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 8. Deploy Rules and Indexes

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

### 9. Run Code Generation

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 10. Output Summary

```
Cloud Firestore Setup Complete
==============================

Collection: {{collection}}
Model: {{Model}}

Files Created:
- lib/core/firebase/firestore_repository.dart
- lib/features/{{collection}}/domain/entities/{{model}}.dart
- lib/features/{{collection}}/data/repositories/{{collection}}_repository.dart
- lib/features/{{collection}}/presentation/providers/{{collection}}_provider.dart
- firestore.rules
- firestore.indexes.json

Dependencies Added:
- cloud_firestore: ^4.15.8
- freezed_annotation: ^2.4.1
- freezed: ^2.4.7 (dev)

Next Steps:
1. Run `dart run build_runner build`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Deploy indexes: `firebase deploy --only firestore:indexes`
4. Test CRUD operations
```

## Agent Reference

For Firestore patterns, consult the `flutter-firebase-firestore` agent.
