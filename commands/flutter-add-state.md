---
name: flutter-add-state
description: Add state management to an existing feature or create new state management files
arguments:
  - name: feature-name
    description: Name of the existing feature to add state management to
    required: true
    type: string
  - name: type
    description: State management solution to use
    type: choice
    options: [riverpod, bloc, provider]
    default: riverpod
  - name: async
    description: Include async state handling with loading/error states
    type: boolean
    default: false
  - name: persist
    description: Add persistence support (Hive for Riverpod, HydratedBloc for Bloc)
    type: boolean
    default: false
  - name: migrate
    description: Source state manager to migrate from
    type: choice
    options: [riverpod, bloc, provider]
    required: false
agents:
  - flutter-state-manager
  - flutter-architect
---

# Flutter Add State Command

Add state management to an existing feature or create new state management files.

## Usage

```
/flutter-add-state <feature-name> [options]
```

## Options

- `--type <manager>`: State manager (riverpod, bloc, provider)
- `--async`: Include async state handling
- `--persist`: Add persistence support
- `--migrate`: Migrate from another state manager

## Examples

```
/flutter-add-state products --type riverpod
/flutter-add-state orders --type bloc --async
/flutter-add-state settings --type provider --persist
/flutter-add-state auth --type riverpod --migrate bloc
```

## State Management Patterns

### Riverpod

#### Basic Provider

```dart
// lib/features/{{feature}}/presentation/providers/{{feature}}_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part '{{feature}}_provider.g.dart';

// Simple state provider
@riverpod
class {{Feature}}State extends _${{Feature}}State {
  @override
  {{Feature}}Model build() {
    return const {{Feature}}Model();
  }

  void update({{Feature}}Model model) {
    state = model;
  }
}

// Async provider with auto-dispose
@riverpod
Future<List<{{Feature}}>> {{feature}}List({{Feature}}ListRef ref) async {
  final repository = ref.watch({{feature}}RepositoryProvider);
  return repository.getAll();
}

// Stream provider
@riverpod
Stream<List<{{Feature}}>> {{feature}}Stream({{Feature}}StreamRef ref) {
  final repository = ref.watch({{feature}}RepositoryProvider);
  return repository.watchAll();
}

// Family provider (with parameter)
@riverpod
Future<{{Feature}}?> {{feature}}ById({{Feature}}ByIdRef ref, String id) async {
  final repository = ref.watch({{feature}}RepositoryProvider);
  return repository.getById(id);
}
```

#### Notifier with CRUD

```dart
// lib/features/{{feature}}/presentation/providers/{{feature}}_notifier.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/{{feature}}.dart';
import '../../domain/repositories/{{feature}}_repository.dart';

part '{{feature}}_notifier.g.dart';

@riverpod
class {{Feature}}Notifier extends _${{Feature}}Notifier {
  @override
  Future<List<{{Feature}}>> build() async {
    return _fetchAll();
  }

  Future<List<{{Feature}}>> _fetchAll() async {
    return ref.read({{feature}}RepositoryProvider).getAll();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetchAll);
  }

  Future<void> create({{Feature}} item) async {
    state = const AsyncLoading();
    await ref.read({{feature}}RepositoryProvider).create(item);
    state = await AsyncValue.guard(_fetchAll);
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

### Bloc

#### Events

```dart
// lib/features/{{feature}}/presentation/bloc/{{feature}}_event.dart
part of '{{feature}}_bloc.dart';

sealed class {{Feature}}Event {}

final class {{Feature}}Started extends {{Feature}}Event {}

final class {{Feature}}Loaded extends {{Feature}}Event {
  final List<{{Feature}}> items;
  {{Feature}}Loaded(this.items);
}

final class {{Feature}}Created extends {{Feature}}Event {
  final {{Feature}} item;
  {{Feature}}Created(this.item);
}

final class {{Feature}}Updated extends {{Feature}}Event {
  final String id;
  final {{Feature}} item;
  {{Feature}}Updated(this.id, this.item);
}

final class {{Feature}}Deleted extends {{Feature}}Event {
  final String id;
  {{Feature}}Deleted(this.id);
}

final class {{Feature}}Refreshed extends {{Feature}}Event {}
```

#### State

```dart
// lib/features/{{feature}}/presentation/bloc/{{feature}}_state.dart
part of '{{feature}}_bloc.dart';

sealed class {{Feature}}State {}

final class {{Feature}}Initial extends {{Feature}}State {}

final class {{Feature}}Loading extends {{Feature}}State {}

final class {{Feature}}Success extends {{Feature}}State {
  final List<{{Feature}}> items;
  {{Feature}}Success(this.items);
}

final class {{Feature}}Failure extends {{Feature}}State {
  final String message;
  {{Feature}}Failure(this.message);
}
```

#### Bloc

```dart
// lib/features/{{feature}}/presentation/bloc/{{feature}}_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/{{feature}}.dart';
import '../../domain/repositories/{{feature}}_repository.dart';

part '{{feature}}_event.dart';
part '{{feature}}_state.dart';

class {{Feature}}Bloc extends Bloc<{{Feature}}Event, {{Feature}}State> {
  final {{Feature}}Repository _repository;

  {{Feature}}Bloc(this._repository) : super({{Feature}}Initial()) {
    on<{{Feature}}Started>(_onStarted);
    on<{{Feature}}Created>(_onCreated);
    on<{{Feature}}Updated>(_onUpdated);
    on<{{Feature}}Deleted>(_onDeleted);
    on<{{Feature}}Refreshed>(_onRefreshed);
  }

  Future<void> _onStarted(
    {{Feature}}Started event,
    Emitter<{{Feature}}State> emit,
  ) async {
    emit({{Feature}}Loading());
    try {
      final items = await _repository.getAll();
      emit({{Feature}}Success(items));
    } catch (e) {
      emit({{Feature}}Failure(e.toString()));
    }
  }

  Future<void> _onCreated(
    {{Feature}}Created event,
    Emitter<{{Feature}}State> emit,
  ) async {
    emit({{Feature}}Loading());
    try {
      await _repository.create(event.item);
      final items = await _repository.getAll();
      emit({{Feature}}Success(items));
    } catch (e) {
      emit({{Feature}}Failure(e.toString()));
    }
  }

  Future<void> _onUpdated(
    {{Feature}}Updated event,
    Emitter<{{Feature}}State> emit,
  ) async {
    try {
      await _repository.update(event.id, event.item);
      final items = await _repository.getAll();
      emit({{Feature}}Success(items));
    } catch (e) {
      emit({{Feature}}Failure(e.toString()));
    }
  }

  Future<void> _onDeleted(
    {{Feature}}Deleted event,
    Emitter<{{Feature}}State> emit,
  ) async {
    try {
      await _repository.delete(event.id);
      final items = await _repository.getAll();
      emit({{Feature}}Success(items));
    } catch (e) {
      emit({{Feature}}Failure(e.toString()));
    }
  }

  Future<void> _onRefreshed(
    {{Feature}}Refreshed event,
    Emitter<{{Feature}}State> emit,
  ) async {
    add({{Feature}}Started());
  }
}
```

### Provider (Simple)

```dart
// lib/features/{{feature}}/presentation/providers/{{feature}}_provider.dart
import 'package:flutter/foundation.dart';
import '../../domain/entities/{{feature}}.dart';
import '../../domain/repositories/{{feature}}_repository.dart';

class {{Feature}}Provider extends ChangeNotifier {
  final {{Feature}}Repository _repository;

  {{Feature}}Provider(this._repository);

  List<{{Feature}}> _items = [];
  List<{{Feature}}> get items => _items;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _items = await _repository.getAll();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> create({{Feature}} item) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _repository.create(item);
      await loadAll();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> update(String id, {{Feature}} item) async {
    try {
      await _repository.update(id, item);
      await loadAll();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> delete(String id) async {
    try {
      await _repository.delete(id);
      _items.removeWhere((item) => item.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
```

## Persistence Support

### Riverpod with Hive

```dart
@riverpod
class Persisted{{Feature}} extends _$Persisted{{Feature}} {
  late Box<{{Feature}}Model> _box;

  @override
  Future<{{Feature}}Model?> build() async {
    _box = await Hive.openBox<{{Feature}}Model>('{{feature}}');
    return _box.get('current');
  }

  Future<void> save({{Feature}}Model model) async {
    await _box.put('current', model);
    state = AsyncData(model);
  }

  Future<void> clear() async {
    await _box.delete('current');
    state = const AsyncData(null);
  }
}
```

### Bloc with Hydrated Bloc

```dart
class {{Feature}}Bloc extends HydratedBloc<{{Feature}}Event, {{Feature}}State> {
  {{Feature}}Bloc() : super({{Feature}}Initial());

  @override
  {{Feature}}State? fromJson(Map<String, dynamic> json) {
    return {{Feature}}State.fromJson(json);
  }

  @override
  Map<String, dynamic>? toJson({{Feature}}State state) {
    return state.toJson();
  }
}
```

## Migration

When migrating between state managers, the command will:

1. Analyze existing state management code
2. Map state/events to new paradigm
3. Generate equivalent code in target manager
4. Update imports in consuming widgets
5. Mark old files for removal

## Execution Steps

When `/flutter-add-state` is invoked:

1. Parse feature name and options
2. Detect existing feature structure
3. Check for existing state management
4. Generate state management files
5. Update barrel exports if present
6. Run `dart run build_runner build` for Riverpod
7. Output summary of created/modified files

## Output Summary

```
State Management Added: {{feature}}
===================================

Type: Riverpod
Pattern: Notifier with AsyncValue

Files Created:
- lib/features/{{feature}}/presentation/providers/{{feature}}_provider.dart
- lib/features/{{feature}}/presentation/providers/{{feature}}_notifier.dart

Generated Code:
- {{Feature}}Repository provider
- {{Feature}}Stream provider
- {{Feature}}Notifier with CRUD operations
- {{Feature}}ById family provider

Next Steps:
1. Run: dart run build_runner build
2. Wire up repository implementation
3. Update UI to consume providers
4. Add error handling as needed
```

## Validation

The command validates the following before execution:

- **Feature exists**: Checks if `lib/features/{{feature}}/` directory exists
- **No duplicate state**: Warns if state management already exists (unless migrating)
- **Repository interface**: Verifies repository interface exists in domain layer
- **Dependencies**: Checks for required packages in pubspec.yaml

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Feature not found | Directory `lib/features/{{feature}}/` doesn't exist | Create feature first with `/flutter-new-feature` |
| State already exists | State management files already present | Use `--migrate` to switch or manually remove existing files |
| Missing repository | No repository interface in domain layer | Create repository interface first |
| Missing dependencies | Required packages not in pubspec.yaml | Run `/flutter-pub add <package>` |
| Build runner failed | Code generation error (Riverpod) | Check provider annotations and imports |

## Agent Reference

For additional guidance on state management:

- **State patterns**: Consult the `flutter-state-manager` agent for advanced patterns like caching, optimistic updates, pagination, and real-time sync
- **Architecture integration**: Consult the `flutter-architect` agent for guidance on how state management fits into the overall architecture
- **Performance**: Consult the `flutter-performance-analyst` agent for state rebuild optimization and avoiding unnecessary re-renders
