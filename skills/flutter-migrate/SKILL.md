# /flutter-migrate

Migrate Flutter SDK, dependencies, state management, or architecture patterns.

## Usage

```
/flutter-migrate <type> [options]
```

## Migration Types

- `sdk`: Upgrade Flutter SDK and fix breaking changes
- `null-safety`: Migrate to null safety
- `state`: Migrate between state management solutions
- `architecture`: Refactor project architecture
- `material3`: Migrate to Material 3 design

## Options

- `--dry-run`: Preview changes without applying
- `--from <version>`: Source version/solution
- `--to <version>`: Target version/solution
- `--path <path>`: Target specific directory

## Examples

```
/flutter-migrate sdk
/flutter-migrate sdk --dry-run
/flutter-migrate state --from provider --to riverpod
/flutter-migrate architecture --from layer-first --to feature-first
/flutter-migrate material3
```

## Instructions

When the user invokes `/flutter-migrate`, follow these steps:

### 1. SDK Migration

#### Upgrade Flutter SDK

```bash
# Check current version
flutter --version

# Switch to stable channel
flutter channel stable

# Upgrade Flutter
flutter upgrade

# After upgrade, fix breaking changes
dart fix --apply
```

#### Major Version Migration Checklist

For Flutter 3.x migrations:

```yaml
flutter_3_0_breaking_changes:
  - change: "Material 3 default enabled"
    fix: "Set useMaterial3: false in ThemeData if not ready"

  - change: "ColorScheme changes"
    fix: "Use colorScheme.primary instead of primaryColor"

  - change: "WillPopScope deprecated"
    fix: "Use PopScope widget instead"

  - change: "MaterialStateProperty renamed"
    fix: "Use WidgetStateProperty instead"

flutter_3_16_breaking_changes:
  - change: "WillPopScope → PopScope"
    fix: |
      // Before
      WillPopScope(
        onWillPop: () async => true,
        child: child,
      )
      // After
      PopScope(
        canPop: true,
        onPopInvoked: (didPop) {},
        child: child,
      )
```

### 2. Null Safety Migration

```bash
# Check migration status
dart pub outdated --mode=null-safety

# Run migration tool
dart migrate

# Apply changes
dart migrate --apply-changes

# Verify
dart analyze
```

#### Manual Migration Steps

```dart
// Before (non-null-safe)
String name;
int getValue() {
  return null;
}

// After (null-safe)
String? name;
int? getValue() {
  return null;
}

// Or with late
late String name;

// With required
void setUser({required String name, required int age}) {}
```

### 3. State Management Migration

#### Provider to Riverpod

```dart
// === PROVIDER (Before) ===

// Provider definition
class Counter extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }
}

// Setup
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => Counter()),
  ],
  child: MyApp(),
)

// Usage
Consumer<Counter>(
  builder: (context, counter, child) {
    return Text('${counter.count}');
  },
)

// === RIVERPOD (After) ===

// Provider definition
@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;

  void increment() => state++;
}

// Setup
ProviderScope(
  child: MyApp(),
)

// Usage
Consumer(
  builder: (context, ref, child) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  },
)
```

#### Provider to Bloc

```dart
// === PROVIDER (Before) ===
class AuthNotifier extends ChangeNotifier {
  User? _user;
  User? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<void> signIn(String email, String password) async {
    _user = await authService.signIn(email, password);
    notifyListeners();
  }
}

// === BLOC (After) ===

// Events
abstract class AuthEvent {}
class AuthSignInRequested extends AuthEvent {
  final String email;
  final String password;
  AuthSignInRequested(this.email, this.password);
}

// States
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<AuthSignInRequested>(_onSignIn);
  }

  Future<void> _onSignIn(
    AuthSignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final user = await authService.signIn(event.email, event.password);
    emit(AuthAuthenticated(user));
  }
}
```

#### Bloc to Riverpod

```dart
// === BLOC (Before) ===
BlocProvider(
  create: (_) => CounterBloc(),
  child: BlocBuilder<CounterBloc, int>(
    builder: (context, count) => Text('$count'),
  ),
)

// === RIVERPOD (After) ===
ProviderScope(
  child: Consumer(
    builder: (context, ref, _) {
      final count = ref.watch(counterProvider);
      return Text('$count');
    },
  ),
)
```

### 4. Architecture Migration

#### Layer-First to Feature-First

```bash
# Before: Layer-First
lib/
├── data/
│   ├── models/
│   │   ├── user_model.dart
│   │   └── product_model.dart
│   └── repositories/
│       ├── user_repository.dart
│       └── product_repository.dart
├── domain/
│   ├── entities/
│   └── usecases/
└── presentation/
    ├── pages/
    └── widgets/

# After: Feature-First
lib/
├── core/
│   ├── network/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── pages/
│   │       └── widgets/
│   └── products/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
    └── widgets/
```

Migration script approach:

```bash
# Create new structure
mkdir -p lib/features/auth/{data/{models,repositories},domain/{entities,usecases},presentation/{pages,widgets}}
mkdir -p lib/features/products/{data/{models,repositories},domain/{entities,usecases},presentation/{pages,widgets}}
mkdir -p lib/core/{network,utils}
mkdir -p lib/shared/widgets

# Move files (example)
mv lib/data/models/user_model.dart lib/features/auth/data/models/
mv lib/data/repositories/user_repository.dart lib/features/auth/data/repositories/
mv lib/presentation/pages/login_page.dart lib/features/auth/presentation/pages/

# Update imports (use IDE refactoring or sed)
```

### 5. Material 3 Migration

```dart
// === Before (Material 2) ===
ThemeData(
  primaryColor: Colors.blue,
  accentColor: Colors.amber,
  buttonTheme: ButtonThemeData(
    buttonColor: Colors.blue,
  ),
)

// Widget usage
RaisedButton(onPressed: () {}, child: Text('Click'))
FlatButton(onPressed: () {}, child: Text('Click'))

// === After (Material 3) ===
ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.blue,
    brightness: Brightness.light,
  ),
)

// Widget usage
ElevatedButton(onPressed: () {}, child: Text('Click'))
TextButton(onPressed: () {}, child: Text('Click'))
FilledButton(onPressed: () {}, child: Text('Click'))
```

#### Common Widget Migrations

```dart
// Button migrations
RaisedButton → ElevatedButton
FlatButton → TextButton
OutlineButton → OutlinedButton

// AppBar
AppBar(
  // Before
  brightness: Brightness.dark,
  // After
  systemOverlayStyle: SystemUiOverlayStyle.light,
)

// Theme colors
// Before
Theme.of(context).accentColor
Theme.of(context).primaryColor
// After
Theme.of(context).colorScheme.secondary
Theme.of(context).colorScheme.primary

// Text themes
// Before
Theme.of(context).textTheme.headline1
// After
Theme.of(context).textTheme.displayLarge
```

### 6. Automated Fix Commands

```bash
# Apply all available fixes
dart fix --apply

# Preview fixes
dart fix --dry-run

# Fix specific directory
dart fix --apply lib/features/auth/

# Common fixes applied:
# - unnecessary_new
# - unnecessary_const
# - prefer_const_constructors
# - deprecated API replacements
```

### 7. Verification Steps

After migration:

```bash
# 1. Run analysis
flutter analyze

# 2. Run tests
flutter test

# 3. Check for deprecation warnings
flutter build apk 2>&1 | grep -i deprecated

# 4. Test on all platforms
flutter run -d chrome
flutter run -d ios
flutter run -d android
```

### 8. Output Summary

```
Migration Report
================

Type: State Management (Provider → Riverpod)
Files Modified: 23
Files Created: 12

Changes Applied:
✓ Converted 8 ChangeNotifierProviders to Riverpod providers
✓ Updated 15 Consumer widgets to Riverpod Consumer
✓ Added ProviderScope to main.dart
✓ Updated 23 import statements

Dependencies Updated:
- Removed: provider ^6.0.0
+ Added: flutter_riverpod ^2.5.1
+ Added: riverpod_annotation ^2.3.5
+ Added (dev): riverpod_generator ^2.4.0

Manual Review Required:
1. lib/features/auth/providers/auth_provider.dart:45
   - Complex state logic may need adjustment
2. lib/main.dart:12
   - Verify ProviderScope placement

Next Steps:
1. Run `flutter pub get`
2. Run `dart run build_runner build`
3. Run `flutter test` to verify
4. Review flagged files for manual adjustments
```

## Agent Reference

For architecture guidance, consult the `flutter-architect` agent.
For state management patterns, consult the `flutter-state-manager` agent.
