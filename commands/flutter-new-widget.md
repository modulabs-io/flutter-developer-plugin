---
name: flutter-new-widget
description: Create a new reusable widget with optional tests and documentation
arguments:
  - name: widget-name
    description: Name of the widget in PascalCase (e.g., UserAvatar, ProductCard)
    required: true
    type: string
  - name: type
    description: Widget type to generate
    type: choice
    options: [stateless, stateful, consumer, hookConsumer, hook]
    default: stateless
  - name: location
    description: Location path relative to lib/ (e.g., shared/widgets, features/home/presentation/widgets)
    type: string
    default: shared/widgets
  - name: with-tests
    description: Generate widget tests with golden tests
    type: boolean
    default: false
  - name: with-docs
    description: Generate documentation comments
    type: boolean
    default: true
  - name: export
    description: Add to barrel export file if exists
    type: boolean
    default: true
agents:
  - flutter-widget-builder
  - flutter-test-engineer
---

# Flutter New Widget Command

Create a new reusable widget with optional tests and documentation.

## Usage

```
/flutter-new-widget <widget-name> [options]
```

## Options

- `--type <type>`: Widget type (stateless, stateful, consumer, hookConsumer, hook)
- `--location <path>`: Location relative to lib/ (default: shared/widgets)
- `--with-tests`: Generate widget and golden tests
- `--with-docs`: Include documentation comments (default: true)
- `--export`: Add to barrel export file (default: true)

## Widget Types

| Type | Description | Requires |
|------|-------------|----------|
| `stateless` | Basic StatelessWidget | - |
| `stateful` | StatefulWidget with State class | - |
| `consumer` | Riverpod ConsumerWidget | flutter_riverpod |
| `hookConsumer` | Riverpod HookConsumerWidget | hooks_riverpod |
| `hook` | Flutter Hooks HookWidget | flutter_hooks |

## Examples

```
/flutter-new-widget UserAvatar
/flutter-new-widget ProductCard --type stateful --location features/shop/presentation/widgets
/flutter-new-widget PriceDisplay --type consumer --with-tests
/flutter-new-widget AnimatedCounter --type hookConsumer --with-tests
/flutter-new-widget CustomButton --type stateless --location core/widgets
```

## Generated Files

```
lib/{{location}}/
└── {{widget_name_snake}}.dart

test/{{location}}/
├── {{widget_name_snake}}_test.dart
└── goldens/
    └── {{widget_name_snake}}_golden.png
```

## Template Files

### StatelessWidget

```dart
// lib/shared/widgets/{{widget_name_snake}}.dart
import 'package:flutter/material.dart';

/// A reusable {{WidgetName}} widget.
///
/// Example usage:
/// ```dart
/// {{WidgetName}}(
///   // properties here
/// )
/// ```
class {{WidgetName}} extends StatelessWidget {
  /// Creates a {{WidgetName}}.
  const {{WidgetName}}({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }
}
```

### StatefulWidget

```dart
// lib/shared/widgets/{{widget_name_snake}}.dart
import 'package:flutter/material.dart';

/// A stateful {{WidgetName}} widget.
///
/// Example usage:
/// ```dart
/// {{WidgetName}}(
///   // properties here
/// )
/// ```
class {{WidgetName}} extends StatefulWidget {
  /// Creates a {{WidgetName}}.
  const {{WidgetName}}({
    super.key,
  });

  @override
  State<{{WidgetName}}> createState() => _{{WidgetName}}State();
}

class _{{WidgetName}}State extends State<{{WidgetName}}> {
  @override
  void initState() {
    super.initState();
    // Initialize state here
  }

  @override
  void dispose() {
    // Clean up resources here
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }
}
```

### ConsumerWidget (Riverpod)

```dart
// lib/shared/widgets/{{widget_name_snake}}.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A Riverpod-aware {{WidgetName}} widget.
///
/// Example usage:
/// ```dart
/// {{WidgetName}}(
///   // properties here
/// )
/// ```
class {{WidgetName}} extends ConsumerWidget {
  /// Creates a {{WidgetName}}.
  const {{WidgetName}}({
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Use ref.watch() and ref.read() for state
    return const Placeholder();
  }
}
```

### HookConsumerWidget (Riverpod + Hooks)

```dart
// lib/shared/widgets/{{widget_name_snake}}.dart
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// A {{WidgetName}} widget using Riverpod and Flutter Hooks.
///
/// Example usage:
/// ```dart
/// {{WidgetName}}(
///   // properties here
/// )
/// ```
class {{WidgetName}} extends HookConsumerWidget {
  /// Creates a {{WidgetName}}.
  const {{WidgetName}}({
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Use hooks: useState, useEffect, useAnimationController, etc.
    // Use ref.watch() and ref.read() for Riverpod state

    return const Placeholder();
  }
}
```

### HookWidget (Flutter Hooks)

```dart
// lib/shared/widgets/{{widget_name_snake}}.dart
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

/// A {{WidgetName}} widget using Flutter Hooks.
///
/// Example usage:
/// ```dart
/// {{WidgetName}}(
///   // properties here
/// )
/// ```
class {{WidgetName}} extends HookWidget {
  /// Creates a {{WidgetName}}.
  const {{WidgetName}}({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    // Use hooks: useState, useEffect, useAnimationController, etc.

    return const Placeholder();
  }
}
```

## Test Templates

### Widget Test

```dart
// test/shared/widgets/{{widget_name_snake}}_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:{{package_name}}/shared/widgets/{{widget_name_snake}}.dart';

void main() {
  group('{{WidgetName}}', () {
    testWidgets('renders correctly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: {{WidgetName}}(),
          ),
        ),
      );

      expect(find.byType({{WidgetName}}), findsOneWidget);
    });

    testWidgets('handles tap interaction', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: {{WidgetName}}(
              // onTap: () => tapped = true,
            ),
          ),
        ),
      );

      // await tester.tap(find.byType({{WidgetName}}));
      // expect(tapped, isTrue);
    });
  });
}
```

### Golden Test

```dart
// test/shared/widgets/{{widget_name_snake}}_golden_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:{{package_name}}/shared/widgets/{{widget_name_snake}}.dart';

void main() {
  group('{{WidgetName}} Golden Tests', () {
    testWidgets('matches golden file', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: const Scaffold(
            body: Center(
              child: RepaintBoundary(
                child: {{WidgetName}}(),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType({{WidgetName}}),
        matchesGoldenFile('goldens/{{widget_name_snake}}_golden.png'),
      );
    });

    testWidgets('matches golden file (dark theme)', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: const Scaffold(
            body: Center(
              child: RepaintBoundary(
                child: {{WidgetName}}(),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType({{WidgetName}}),
        matchesGoldenFile('goldens/{{widget_name_snake}}_dark_golden.png'),
      );
    });
  });
}
```

### Consumer Widget Test (Riverpod)

```dart
// test/shared/widgets/{{widget_name_snake}}_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:{{package_name}}/shared/widgets/{{widget_name_snake}}.dart';

void main() {
  group('{{WidgetName}}', () {
    testWidgets('renders correctly', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: {{WidgetName}}(),
            ),
          ),
        ),
      );

      expect(find.byType({{WidgetName}}), findsOneWidget);
    });

    testWidgets('renders with overridden providers', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            // Add provider overrides here
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: {{WidgetName}}(),
            ),
          ),
        ),
      );

      expect(find.byType({{WidgetName}}), findsOneWidget);
    });
  });
}
```

## Barrel Export Update

When `--export` is enabled, the command updates or creates a barrel export file:

```dart
// lib/shared/widgets/widgets.dart (barrel file)
export '{{widget_name_snake}}.dart';
// ... other exports
```

## Common Widget Patterns

### Widget with Callbacks

```dart
class {{WidgetName}} extends StatelessWidget {
  final VoidCallback? onPressed;
  final ValueChanged<String>? onChanged;

  const {{WidgetName}}({
    super.key,
    this.onPressed,
    this.onChanged,
  });
  // ...
}
```

### Widget with Theme Extension

```dart
class {{WidgetName}} extends StatelessWidget {
  const {{WidgetName}}({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Container(
      color: colorScheme.surface,
      child: Text(
        'Content',
        style: textTheme.bodyMedium,
      ),
    );
  }
}
```

### Widget with Animation

```dart
class {{WidgetName}} extends StatefulWidget {
  const {{WidgetName}}({super.key});

  @override
  State<{{WidgetName}}> createState() => _{{WidgetName}}State();
}

class _{{WidgetName}}State extends State<{{WidgetName}}>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: const Placeholder(),
    );
  }
}
```

## Execution Steps

When `/flutter-new-widget` is invoked:

1. Parse widget name and options
2. Validate widget name is PascalCase
3. Check location directory exists (create if not)
4. Generate widget file based on type
5. Generate test files if `--with-tests`
6. Update barrel export if `--export` and barrel exists
7. Output summary

## Output Summary

```
Widget Created: {{WidgetName}}
==============================

Type: StatelessWidget
Location: lib/shared/widgets/{{widget_name_snake}}.dart

Files Created:
- lib/shared/widgets/{{widget_name_snake}}.dart
- test/shared/widgets/{{widget_name_snake}}_test.dart
- test/shared/widgets/{{widget_name_snake}}_golden_test.dart

Barrel Export Updated:
- lib/shared/widgets/widgets.dart

Next Steps:
1. Implement widget build method
2. Add widget properties as needed
3. Run golden tests: flutter test --update-goldens
4. Import from: import 'package:{{package}}/shared/widgets/widgets.dart';
```

## Validation

The command validates the following before execution:

- **Widget name**: Must be PascalCase and valid Dart identifier
- **No duplicate**: Checks if widget file already exists
- **Location**: Validates location path is valid
- **Dependencies**: Checks for required packages based on widget type

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Invalid widget name | Name not in PascalCase | Use PascalCase (e.g., UserAvatar, ProductCard) |
| Widget already exists | File at location exists | Use different name or remove existing file |
| Invalid location | Path contains invalid characters | Use valid directory path |
| Missing dependency | flutter_hooks or riverpod not installed | Run `/flutter-pub add <package>` |
| Barrel not found | No widgets.dart in location | Create manually or omit `--export` |

## Agent Reference

For widget development guidance:

- **Widget patterns**: Consult the `flutter-widget-builder` agent for composition patterns, responsive design, and accessibility best practices
- **Testing strategy**: Consult the `flutter-test-engineer` agent for widget testing strategies, golden test workflows, and mock setup
- **Performance**: Consult the `flutter-performance-analyst` agent for widget rebuild optimization and const constructor usage
