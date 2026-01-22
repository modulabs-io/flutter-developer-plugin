# /flutter-analyze

Run static code analysis, apply auto-fixes, and ensure code quality standards.

## Usage

```
/flutter-analyze [options] [path]
```

## Options

- `--fix`: Automatically apply fixes for issues that have fixes available
- `--fix-dry-run`: Show what fixes would be applied without applying them
- `--fatal-infos`: Treat info level issues as fatal (exit code 1)
- `--fatal-warnings`: Treat warnings as fatal (default: true)
- `--no-fatal-warnings`: Don't treat warnings as fatal
- `--format`: Also run dart format check
- `--metrics`: Include code metrics (lines of code, complexity)

## Examples

```
/flutter-analyze
/flutter-analyze --fix
/flutter-analyze --fix lib/features/
/flutter-analyze --fix-dry-run
/flutter-analyze --format --metrics
```

## Instructions

When the user invokes `/flutter-analyze`, follow these steps:

### 1. Verify Flutter Environment

```bash
flutter --version
```

Ensure Flutter SDK is available and note the version for compatibility.

### 2. Check for pubspec.yaml

Verify the current directory is a Flutter project:

```bash
test -f pubspec.yaml && echo "Flutter project found" || echo "Not a Flutter project"
```

### 3. Ensure Dependencies Are Up to Date

```bash
flutter pub get
```

### 4. Run Flutter Analyzer

```bash
# Basic analysis
flutter analyze

# With path specification
flutter analyze {{path}}

# For CI/CD (fail on warnings)
flutter analyze --fatal-warnings --fatal-infos
```

### 5. Parse and Categorize Issues

Categorize issues by severity and type:

```yaml
categories:
  errors:
    - compilation_errors
    - runtime_errors
    - type_errors
  warnings:
    - deprecated_api_usage
    - unused_imports
    - dead_code
    - potential_null_dereference
  info:
    - style_issues
    - documentation_missing
    - naming_conventions
```

### 6. Apply Auto-Fixes (if --fix specified)

```bash
# Apply all available fixes
dart fix --apply

# Preview fixes without applying
dart fix --dry-run

# Apply fixes to specific directory
dart fix --apply lib/features/
```

Common auto-fixable issues:
- `unnecessary_new` - Remove `new` keyword
- `unnecessary_const` - Remove redundant `const`
- `prefer_const_constructors` - Add `const` where beneficial
- `prefer_single_quotes` - Convert to single quotes
- `unnecessary_this` - Remove unnecessary `this.`
- `avoid_init_to_null` - Remove explicit null initialization
- `prefer_is_empty` - Use `.isEmpty` instead of `.length == 0`
- `prefer_is_not_empty` - Use `.isNotEmpty` instead of `.length > 0`
- `unnecessary_string_interpolation` - Simplify string interpolation
- `use_rethrow_when_possible` - Use `rethrow` instead of `throw e`

### 7. Run Format Check (if --format specified)

```bash
# Check formatting without changes
dart format --set-exit-if-changed .

# Auto-format all files
dart format .

# Format specific path
dart format lib/
```

### 8. Generate Metrics (if --metrics specified)

```bash
# Using dart_code_metrics (if installed)
dart run dart_code_metrics:metrics analyze lib

# Or using dcm
dcm analyze lib --reporter=console
```

Key metrics to report:
- Lines of Code (LOC)
- Cyclomatic Complexity
- Number of Parameters
- Maintainability Index
- Technical Debt estimation

### 9. Check for Deprecated APIs

Look for usage of deprecated APIs and suggest migrations:

```dart
// Common deprecations to check:
// - FlatButton → TextButton
// - RaisedButton → ElevatedButton
// - OutlineButton → OutlinedButton
// - Theme.of(context).accentColor → Theme.of(context).colorScheme.secondary
// - WillPopScope → PopScope (Flutter 3.16+)
```

### 10. Validate Build Runner Files

If using code generation, check for stale generated files:

```bash
# Check if generated files are up to date
flutter pub run build_runner build --delete-conflicting-outputs
```

### 11. Check for Security Issues

Flag potential security concerns:
- Hardcoded API keys or secrets
- Insecure HTTP connections
- Missing input validation
- Potential SQL/NoSQL injection points
- Debug flags in release code

### 12. Generate Report

Provide a summary report:

```
Analysis Results
================

Errors:    {{error_count}}
Warnings:  {{warning_count}}
Info:      {{info_count}}

Top Issues by Category:
1. Unused imports ({{count}})
2. Missing const constructors ({{count}})
3. Deprecated API usage ({{count}})

Files with Most Issues:
1. lib/features/auth/auth_service.dart ({{count}} issues)
2. lib/core/utils/validators.dart ({{count}} issues)

Auto-Fixable Issues: {{fixable_count}}
Run `/flutter-analyze --fix` to apply fixes.
```

### 13. Suggest Improvements

Based on analysis results, suggest:
- Architecture improvements
- Performance optimizations
- Code organization changes
- Missing tests for complex code

## Custom Analysis Rules

The plugin uses enhanced analysis options. Ensure `analysis_options.yaml` includes:

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  errors:
    # Treat these as errors
    missing_return: error
    missing_required_param: error

  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "**/*.mocks.dart"
    - "**/generated/**"

linter:
  rules:
    # Error prevention
    - avoid_print
    - avoid_web_libraries_in_flutter
    - cancel_subscriptions
    - close_sinks
    - use_build_context_synchronously

    # Style
    - prefer_const_constructors
    - require_trailing_commas
    - sort_child_properties_last
```

## Integration with CI/CD

For CI/CD pipelines, use:

```bash
# Strict analysis for CI
flutter analyze --fatal-infos --fatal-warnings

# Format check
dart format --set-exit-if-changed .

# Combined in one command
flutter analyze --fatal-warnings && dart format --set-exit-if-changed .
```

## Agent Reference

For detailed code quality guidance, consult the `flutter-performance-analyst` agent.
