# /flutter-create

Create new Flutter projects with configurable architecture, state management, and platform support.

## Usage

```
/flutter-create <project_name> [options]
```

## Arguments

- `project_name`: Name of the project (required, must be valid Dart package name)

## Options

- `--org <organization>`: Organization identifier (default: com.example)
- `--state <manager>`: State management solution (riverpod|bloc|provider, default: riverpod)
- `--arch <pattern>`: Architecture pattern (feature-first|layer-first, default: feature-first)
- `--platforms <list>`: Target platforms (ios,android,macos,windows,linux,web)
- `--backend <type>`: Backend integration (none|firebase|supabase, default: none)
- `--template <name>`: Project template (app|package|plugin|ffi, default: app)

## Examples

```
/flutter-create my_app
/flutter-create my_app --state bloc --platforms ios,android
/flutter-create my_app --org com.mycompany --backend firebase --platforms ios,android,macos
/flutter-create my_package --template package
```

## Instructions

When the user invokes `/flutter-create`, follow these steps:

### 1. Parse Arguments and Set Defaults

```yaml
defaults:
  org: com.example
  state: riverpod
  arch: feature-first
  platforms: [ios, android]
  backend: none
  template: app
```

### 2. Validate Project Name

Ensure the project name:
- Is lowercase with underscores (snake_case)
- Does not start with a number
- Is not a Dart reserved word
- Is a valid Dart package name

### 3. Create Base Project

Run the appropriate Flutter create command:

```bash
# For app template
flutter create --org {{org}} --platforms {{platforms}} {{project_name}}

# For package template
flutter create --template=package {{project_name}}

# For plugin template
flutter create --template=plugin --platforms {{platforms}} {{project_name}}

# For FFI template
flutter create --template=package_ffi {{project_name}}
```

### 4. Set Up Project Structure (Feature-First Architecture)

Create the recommended folder structure:

```
lib/
├── core/
│   ├── constants/
│   │   └── app_constants.dart
│   ├── extensions/
│   │   └── string_extensions.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   └── app_colors.dart
│   ├── utils/
│   │   └── validators.dart
│   └── core.dart
├── features/
│   └── home/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── pages/
│           │   └── home_page.dart
│           ├── widgets/
│           └── controllers/ (or bloc/ or providers/)
├── shared/
│   ├── widgets/
│   │   └── shared_widgets.dart
│   └── services/
│       └── shared_services.dart
├── app.dart
└── main.dart
```

### 5. Configure State Management

#### For Riverpod:

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

dev_dependencies:
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.9
```

Create `lib/main.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  runApp(
    const ProviderScope(
      child: App(),
    ),
  );
}
```

#### For Bloc:

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_bloc: ^8.1.5
  bloc: ^8.1.4
  equatable: ^2.0.5

dev_dependencies:
  bloc_test: ^9.1.7
```

Create `lib/main.dart`:
```dart
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const App());
}
```

#### For Provider:

Add to `pubspec.yaml`:
```yaml
dependencies:
  provider: ^6.1.2
```

### 6. Configure Backend (if selected)

#### For Firebase:
```bash
# Install FlutterFire CLI if not present
dart pub global activate flutterfire_cli

# Configure Firebase
flutterfire configure --project={{firebase_project}}
```

Add to `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.27.0
```

#### For Supabase:
```bash
# Install Supabase CLI if not present
npm install -g supabase
```

Add to `pubspec.yaml`:
```yaml
dependencies:
  supabase_flutter: ^2.5.0
```

### 7. Set Up Analysis Options

Create `analysis_options.yaml`:
```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  errors:
    invalid_annotation_target: ignore
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    - always_declare_return_types
    - always_use_package_imports
    - avoid_empty_else
    - avoid_print
    - avoid_relative_lib_imports
    - avoid_returning_null_for_future
    - avoid_slow_async_io
    - avoid_type_to_string
    - avoid_types_as_parameter_names
    - avoid_web_libraries_in_flutter
    - cancel_subscriptions
    - close_sinks
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_final_locals
    - require_trailing_commas
    - sort_child_properties_last
    - sort_constructors_first
    - unawaited_futures
    - unnecessary_await_in_return
    - use_build_context_synchronously
```

### 8. Add Common Dependencies

Add recommended packages to `pubspec.yaml`:
```yaml
dependencies:
  # Core
  collection: ^1.18.0
  intl: ^0.19.0

  # Networking
  dio: ^5.4.2+1

  # Local Storage
  shared_preferences: ^2.2.2

  # Utilities
  logger: ^2.2.0
  equatable: ^2.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.9
  mocktail: ^1.0.3
```

### 9. Run Initial Setup

```bash
cd {{project_name}}
flutter pub get
dart format .
flutter analyze
```

### 10. Create Initial Test Structure

```
test/
├── core/
│   └── utils/
│       └── validators_test.dart
├── features/
│   └── home/
│       ├── data/
│       ├── domain/
│       └── presentation/
│           └── pages/
│               └── home_page_test.dart
├── helpers/
│   ├── pump_app.dart
│   └── test_helpers.dart
└── widget_test.dart
```

### 11. Output Summary

After creation, display:
- Project location
- Selected configuration
- Next steps (flutter run, adding features)
- Useful commands

## Agent Reference

For architecture decisions, consult the `flutter-architect` agent.
For state management patterns, consult the `flutter-state-manager` agent.
