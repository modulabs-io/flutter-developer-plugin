---
name: flutter-new-feature
description: Create a new feature module following the project's architecture pattern with domain/data/presentation layers
arguments:
  - name: feature-name
    description: Name of the feature in snake_case (e.g., user_profile, shopping_cart)
    required: true
    type: string
  - name: arch
    description: Architecture pattern to use
    type: choice
    options: [feature-first, layer-first]
    default: feature-first
  - name: state
    description: State management solution
    type: choice
    options: [riverpod, bloc, provider]
    default: riverpod
  - name: crud
    description: Include CRUD operations scaffolding
    type: boolean
    default: false
  - name: test
    description: Generate test files
    type: boolean
    default: false
agents:
  - flutter-architect
  - flutter-state-manager
  - flutter-test-engineer
---

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
/flutter-new-feature user_profile --state bloc --crud --test
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

## State Management Templates

### Riverpod Provider

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

### Riverpod List Page

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

### Bloc List Page

```dart
// lib/features/{{feature}}/presentation/pages/{{feature}}_list_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/{{feature}}_bloc.dart';
import '../widgets/{{feature}}_card.dart';

class {{Feature}}ListPage extends StatelessWidget {
  const {{Feature}}ListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => {{Feature}}Bloc(
        context.read<{{Feature}}Repository>(),
      )..add({{Feature}}Started()),
      child: const _{{Feature}}ListView(),
    );
  }
}

class _{{Feature}}ListView extends StatelessWidget {
  const _{{Feature}}ListView();

  @override
  Widget build(BuildContext context) {
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
      body: BlocBuilder<{{Feature}}Bloc, {{Feature}}State>(
        builder: (context, state) {
          return switch (state) {
            {{Feature}}Initial() => const Center(
                child: Text('Press refresh to load'),
              ),
            {{Feature}}Loading() => const Center(
                child: CircularProgressIndicator(),
              ),
            {{Feature}}Success(:final items) => items.isEmpty
                ? const Center(child: Text('No items found'))
                : ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      return {{Feature}}Card(
                        item: items[index],
                        onTap: () {
                          // Navigate to detail page
                        },
                      );
                    },
                  ),
            {{Feature}}Failure(:final message) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error: $message'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        context.read<{{Feature}}Bloc>().add({{Feature}}Refreshed());
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
          };
        },
      ),
    );
  }
}
```

### Provider List Page

```dart
// lib/features/{{feature}}/presentation/pages/{{feature}}_list_page.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/{{feature}}_provider.dart';
import '../widgets/{{feature}}_card.dart';

class {{Feature}}ListPage extends StatefulWidget {
  const {{Feature}}ListPage({super.key});

  @override
  State<{{Feature}}ListPage> createState() => _{{Feature}}ListPageState();
}

class _{{Feature}}ListPageState extends State<{{Feature}}ListPage> {
  @override
  void initState() {
    super.initState();
    // Load data on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<{{Feature}}Provider>().loadAll();
    });
  }

  @override
  Widget build(BuildContext context) {
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
      body: Consumer<{{Feature}}Provider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${provider.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadAll(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final items = provider.items;
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

## Validation

The command validates the following before execution:

- **Feature name**: Must be snake_case, start with a letter, and not contain special characters
- **Directory conflicts**: Checks if `lib/features/{{feature}}` already exists
- **Project structure**: Verifies `lib/` directory exists and pubspec.yaml is present
- **Dependencies**: Checks for required packages based on state management choice

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Feature already exists | Directory `lib/features/{{feature}}/` exists | Use a different name or delete existing feature |
| Invalid feature name | Name contains invalid characters | Use snake_case with letters and underscores |
| Missing dependencies | Required packages not in pubspec.yaml | Run `/flutter-pub add <package>` |
| Build runner failed | Code generation error | Check generated files for syntax errors |

## Agent Reference

For additional guidance on specific aspects of feature development:

- **Architecture decisions**: Consult the `flutter-architect` agent for guidance on feature structure, layer boundaries, and dependency injection patterns
- **State management**: Consult the `flutter-state-manager` agent for advanced state patterns, caching strategies, and optimistic updates
- **Testing strategy**: Consult the `flutter-test-engineer` agent for test organization, mocking strategies, and coverage requirements
