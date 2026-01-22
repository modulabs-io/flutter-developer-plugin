# Flutter New Feature Command

Create a new feature module following the project's architecture pattern.

## Usage

```
/flutter-new-feature <feature-name> [options]
```

## Options

- `--arch <pattern>`: Architecture pattern (feature-first, layer-first)
- `--state <manager>`: State management (riverpod, bloc, provider)
- `--crud`: Include CRUD operations scaffolding
- `--test`: Generate test files

## Examples

```
/flutter-new-feature products
/flutter-new-feature orders --state riverpod --crud
/flutter-new-feature settings --arch feature-first --test
```

## Generated Structure

### Feature-First (Default)

```
lib/features/{{feature}}/
├── data/
│   ├── datasources/
│   │   ├── {{feature}}_local_datasource.dart
│   │   └── {{feature}}_remote_datasource.dart
│   ├── models/
│   │   └── {{feature}}_model.dart
│   └── repositories/
│       └── {{feature}}_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── {{feature}}.dart
│   ├── repositories/
│   │   └── {{feature}}_repository.dart
│   └── usecases/
│       ├── get_{{feature}}.dart
│       ├── get_{{feature}}_list.dart
│       ├── create_{{feature}}.dart
│       ├── update_{{feature}}.dart
│       └── delete_{{feature}}.dart
└── presentation/
    ├── pages/
    │   ├── {{feature}}_list_page.dart
    │   └── {{feature}}_detail_page.dart
    ├── providers/
    │   └── {{feature}}_provider.dart
    └── widgets/
        ├── {{feature}}_card.dart
        └── {{feature}}_form.dart
```

## Template Files

### Entity

```dart
// lib/features/{{feature}}/domain/entities/{{feature}}.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part '{{feature}}.freezed.dart';
part '{{feature}}.g.dart';

@freezed
class {{Feature}} with _${{Feature}} {
  const factory {{Feature}}({
    required String id,
    required String name,
    String? description,
    @Default(true) bool isActive,
    required DateTime createdAt,
    DateTime? updatedAt,
  }) = _{{Feature}};

  const {{Feature}}._();

  factory {{Feature}}.fromJson(Map<String, dynamic> json) =>
      _${{Feature}}FromJson(json);
}
```

### Repository Interface

```dart
// lib/features/{{feature}}/domain/repositories/{{feature}}_repository.dart
import '../entities/{{feature}}.dart';

abstract class {{Feature}}Repository {
  Future<{{Feature}}?> getById(String id);
  Future<List<{{Feature}}>> getAll();
  Future<{{Feature}}> create({{Feature}} item);
  Future<{{Feature}}> update(String id, {{Feature}} item);
  Future<void> delete(String id);
  Stream<List<{{Feature}}>> watchAll();
}
```

### Repository Implementation

```dart
// lib/features/{{feature}}/data/repositories/{{feature}}_repository_impl.dart
import '../../domain/entities/{{feature}}.dart';
import '../../domain/repositories/{{feature}}_repository.dart';
import '../datasources/{{feature}}_remote_datasource.dart';

class {{Feature}}RepositoryImpl implements {{Feature}}Repository {
  final {{Feature}}RemoteDataSource _remoteDataSource;

  {{Feature}}RepositoryImpl(this._remoteDataSource);

  @override
  Future<{{Feature}}?> getById(String id) async {
    return _remoteDataSource.getById(id);
  }

  @override
  Future<List<{{Feature}}>> getAll() async {
    return _remoteDataSource.getAll();
  }

  @override
  Future<{{Feature}}> create({{Feature}} item) async {
    return _remoteDataSource.create(item);
  }

  @override
  Future<{{Feature}}> update(String id, {{Feature}} item) async {
    return _remoteDataSource.update(id, item);
  }

  @override
  Future<void> delete(String id) async {
    return _remoteDataSource.delete(id);
  }

  @override
  Stream<List<{{Feature}}>> watchAll() {
    return _remoteDataSource.watchAll();
  }
}
```

### Provider (Riverpod)

```dart
// lib/features/{{feature}}/presentation/providers/{{feature}}_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/{{feature}}.dart';
import '../../domain/repositories/{{feature}}_repository.dart';

part '{{feature}}_provider.g.dart';

@riverpod
{{Feature}}Repository {{feature}}Repository({{Feature}}RepositoryRef ref) {
  // TODO: Return repository implementation
  throw UnimplementedError();
}

@riverpod
Stream<List<{{Feature}}>> {{feature}}Stream({{Feature}}StreamRef ref) {
  return ref.watch({{feature}}RepositoryProvider).watchAll();
}

@riverpod
class {{Feature}}Notifier extends _${{Feature}}Notifier {
  @override
  Future<List<{{Feature}}>> build() async {
    return ref.watch({{feature}}RepositoryProvider).getAll();
  }

  Future<void> create({{Feature}} item) async {
    await ref.read({{feature}}RepositoryProvider).create(item);
    ref.invalidateSelf();
  }

  Future<void> update(String id, {{Feature}} item) async {
    await ref.read({{feature}}RepositoryProvider).update(id, item);
    ref.invalidateSelf();
  }

  Future<void> delete(String id) async {
    await ref.read({{feature}}RepositoryProvider).delete(id);
    ref.invalidateSelf();
  }
}
```

### List Page

```dart
// lib/features/{{feature}}/presentation/pages/{{feature}}_list_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/{{feature}}_provider.dart';
import '../widgets/{{feature}}_card.dart';

class {{Feature}}ListPage extends ConsumerWidget {
  const {{Feature}}ListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final {{feature}}sAsync = ref.watch({{feature}}NotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('{{Feature}}s'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navigate to create page
            },
          ),
        ],
      ),
      body: {{feature}}sAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(
              child: Text('No items found'),
            );
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              return {{Feature}}Card(
                item: items[index],
                onTap: () {
                  // Navigate to detail page
                },
              );
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Text('Error: $error'),
        ),
      ),
    );
  }
}
```

### Card Widget

```dart
// lib/features/{{feature}}/presentation/widgets/{{feature}}_card.dart
import 'package:flutter/material.dart';
import '../../domain/entities/{{feature}}.dart';

class {{Feature}}Card extends StatelessWidget {
  final {{Feature}} item;
  final VoidCallback? onTap;

  const {{Feature}}Card({
    super.key,
    required this.item,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(item.name),
        subtitle: item.description != null ? Text(item.description!) : null,
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
```

## Test Templates

### Unit Test

```dart
// test/features/{{feature}}/domain/usecases/get_{{feature}}_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class Mock{{Feature}}Repository extends Mock implements {{Feature}}Repository {}

void main() {
  late {{Feature}}Repository repository;

  setUp(() {
    repository = Mock{{Feature}}Repository();
  });

  group('Get{{Feature}}', () {
    test('should return {{feature}} from repository', () async {
      // Arrange
      final expected = {{Feature}}(
        id: '1',
        name: 'Test',
        createdAt: DateTime.now(),
      );
      when(() => repository.getById('1')).thenAnswer((_) async => expected);

      // Act
      final result = await repository.getById('1');

      // Assert
      expect(result, expected);
      verify(() => repository.getById('1')).called(1);
    });
  });
}
```

## Execution Steps

When `/flutter-new-feature` is invoked:

1. Parse feature name and options
2. Detect project architecture pattern
3. Detect state management solution
4. Create directory structure
5. Generate entity with Freezed annotations
6. Generate repository interface
7. Generate repository implementation
8. Generate providers/blocs based on state management
9. Generate basic UI pages and widgets
10. Generate test files if requested
11. Run `dart run build_runner build`
12. Output summary of created files

## Output Summary

```
Feature Created: {{feature}}
=============================

Architecture: feature-first
State Management: riverpod

Files Created:
Domain Layer:
  - lib/features/{{feature}}/domain/entities/{{feature}}.dart
  - lib/features/{{feature}}/domain/repositories/{{feature}}_repository.dart

Data Layer:
  - lib/features/{{feature}}/data/repositories/{{feature}}_repository_impl.dart
  - lib/features/{{feature}}/data/datasources/{{feature}}_remote_datasource.dart

Presentation Layer:
  - lib/features/{{feature}}/presentation/providers/{{feature}}_provider.dart
  - lib/features/{{feature}}/presentation/pages/{{feature}}_list_page.dart
  - lib/features/{{feature}}/presentation/widgets/{{feature}}_card.dart

Tests:
  - test/features/{{feature}}/domain/usecases/get_{{feature}}_test.dart

Next Steps:
1. Run: dart run build_runner build
2. Implement data source methods
3. Wire up repository in providers
4. Add routes to navigation
```
