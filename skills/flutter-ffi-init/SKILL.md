# /flutter-ffi-init

Initialize a new Flutter FFI project with native code support.

## Usage

```
/flutter-ffi-init <project_name> [options]
```

## Options

- `--org <organization>`: Organization identifier (default: com.example)
- `--language <lang>`: Native language (c|rust, default: c)
- `--platforms <list>`: Target platforms (ios,android,macos,windows,linux)

## Examples

```
/flutter-ffi-init my_native_lib
/flutter-ffi-init my_native_lib --language rust
/flutter-ffi-init my_native_lib --org com.mycompany --platforms ios,android,macos
```

## Instructions

When the user invokes `/flutter-ffi-init`, follow these steps:

### 1. Create Project with FFI Template

```bash
# Create FFI package
flutter create --template=package_ffi {{project_name}}

cd {{project_name}}
```

This creates the standard FFI structure:
```
{{project_name}}/
├── lib/
│   ├── {{project_name}}.dart          # Public API
│   └── {{project_name}}_bindings_generated.dart
├── src/
│   └── {{project_name}}.c              # Native C code
├── ffigen.yaml                        # ffigen configuration
├── pubspec.yaml
├── android/
├── ios/
├── linux/
├── macos/
└── windows/
```

### 2. Configure pubspec.yaml

```yaml
name: {{project_name}}
description: A Flutter FFI plugin.
version: 0.0.1
publish_to: none

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: '>=3.3.0'

dependencies:
  ffi: ^2.1.2
  flutter:
    sdk: flutter

dev_dependencies:
  ffigen: ^11.0.0
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  plugin:
    platforms:
      android:
        ffiPlugin: true
      ios:
        ffiPlugin: true
      linux:
        ffiPlugin: true
      macos:
        ffiPlugin: true
      windows:
        ffiPlugin: true
```

### 3. Create Native Source Files

#### C Implementation (default)

```c
// src/{{project_name}}.h
#ifndef {{PROJECT_NAME_UPPER}}_H
#define {{PROJECT_NAME_UPPER}}_H

#include <stdint.h>
#include <stdbool.h>

#ifdef _WIN32
#define FFI_PLUGIN_EXPORT __declspec(dllexport)
#else
#define FFI_PLUGIN_EXPORT __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

// Version info
FFI_PLUGIN_EXPORT const char* {{project_name}}_version(void);

// Example functions
FFI_PLUGIN_EXPORT int32_t {{project_name}}_add(int32_t a, int32_t b);
FFI_PLUGIN_EXPORT int32_t {{project_name}}_multiply(int32_t a, int32_t b);

// Struct example
typedef struct {
    double x;
    double y;
} {{ProjectName}}Point;

FFI_PLUGIN_EXPORT {{ProjectName}}Point {{project_name}}_create_point(double x, double y);
FFI_PLUGIN_EXPORT double {{project_name}}_point_distance({{ProjectName}}Point* p1, {{ProjectName}}Point* p2);

// String handling
FFI_PLUGIN_EXPORT char* {{project_name}}_greet(const char* name);
FFI_PLUGIN_EXPORT void {{project_name}}_free_string(char* str);

#ifdef __cplusplus
}
#endif

#endif // {{PROJECT_NAME_UPPER}}_H
```

```c
// src/{{project_name}}.c
#include "{{project_name}}.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <math.h>

const char* {{project_name}}_version(void) {
    return "1.0.0";
}

int32_t {{project_name}}_add(int32_t a, int32_t b) {
    return a + b;
}

int32_t {{project_name}}_multiply(int32_t a, int32_t b) {
    return a * b;
}

{{ProjectName}}Point {{project_name}}_create_point(double x, double y) {
    {{ProjectName}}Point point = {x, y};
    return point;
}

double {{project_name}}_point_distance({{ProjectName}}Point* p1, {{ProjectName}}Point* p2) {
    double dx = p2->x - p1->x;
    double dy = p2->y - p1->y;
    return sqrt(dx * dx + dy * dy);
}

char* {{project_name}}_greet(const char* name) {
    const char* prefix = "Hello, ";
    const char* suffix = "!";
    size_t len = strlen(prefix) + strlen(name) + strlen(suffix) + 1;

    char* result = (char*)malloc(len);
    if (result) {
        snprintf(result, len, "%s%s%s", prefix, name, suffix);
    }
    return result;
}

void {{project_name}}_free_string(char* str) {
    free(str);
}
```

### 4. Configure ffigen

```yaml
# ffigen.yaml
name: {{ProjectName}}Bindings
description: |
  Bindings for `src/{{project_name}}.h`.

  Regenerate bindings with `dart run ffigen --config ffigen.yaml`.
output: 'lib/{{project_name}}_bindings_generated.dart'
headers:
  entry-points:
    - 'src/{{project_name}}.h'
  include-directives:
    - 'src/{{project_name}}.h'

comments:
  style: any
  length: full

preamble: |
  // ignore_for_file: always_specify_types
  // ignore_for_file: camel_case_types
  // ignore_for_file: non_constant_identifier_names

functions:
  include:
    - '{{project_name}}_.*'

structs:
  include:
    - '{{ProjectName}}.*'

typedefs:
  include:
    - '{{ProjectName}}.*'
```

### 5. Generate Bindings

```bash
dart run ffigen
```

### 6. Create Dart Wrapper

```dart
// lib/{{project_name}}.dart
import 'dart:ffi';
import 'dart:io';

import 'package:ffi/ffi.dart';

import '{{project_name}}_bindings_generated.dart';

/// The bindings to the native library.
final {{ProjectName}}Bindings _bindings = {{ProjectName}}Bindings(_loadLibrary());

DynamicLibrary _loadLibrary() {
  if (Platform.isMacOS || Platform.isIOS) {
    return DynamicLibrary.open('{{project_name}}.framework/{{project_name}}');
  }
  if (Platform.isAndroid || Platform.isLinux) {
    return DynamicLibrary.open('lib{{project_name}}.so');
  }
  if (Platform.isWindows) {
    return DynamicLibrary.open('{{project_name}}.dll');
  }
  throw UnsupportedError('Unknown platform: ${Platform.operatingSystem}');
}

/// Returns the version of the native library.
String version() {
  return _bindings.{{project_name}}_version().cast<Utf8>().toDartString();
}

/// Adds two integers.
int add(int a, int b) {
  return _bindings.{{project_name}}_add(a, b);
}

/// Multiplies two integers.
int multiply(int a, int b) {
  return _bindings.{{project_name}}_multiply(a, b);
}

/// A point with x and y coordinates.
class Point {
  final double x;
  final double y;

  Point(this.x, this.y);

  /// Calculate distance to another point.
  double distanceTo(Point other) {
    return using((Arena arena) {
      final p1 = arena<{{ProjectName}}Point>();
      final p2 = arena<{{ProjectName}}Point>();

      p1.ref.x = x;
      p1.ref.y = y;
      p2.ref.x = other.x;
      p2.ref.y = other.y;

      return _bindings.{{project_name}}_point_distance(p1, p2);
    });
  }

  @override
  String toString() => 'Point($x, $y)';
}

/// Returns a greeting for the given name.
String greet(String name) {
  final namePtr = name.toNativeUtf8();
  try {
    final resultPtr = _bindings.{{project_name}}_greet(namePtr.cast());
    if (resultPtr == nullptr) {
      throw Exception('Failed to create greeting');
    }
    try {
      return resultPtr.cast<Utf8>().toDartString();
    } finally {
      _bindings.{{project_name}}_free_string(resultPtr);
    }
  } finally {
    calloc.free(namePtr);
  }
}
```

### 7. Platform Build Configuration

Each platform is auto-configured by the template. Verify:

```bash
# Check Android
cat android/CMakeLists.txt

# Check iOS
cat ios/{{project_name}}.podspec

# Check macOS
cat macos/{{project_name}}.podspec

# Check Windows
cat windows/CMakeLists.txt

# Check Linux
cat linux/CMakeLists.txt
```

### 8. Create Example App

```dart
// example/lib/main.dart
import 'package:flutter/material.dart';
import 'package:{{project_name}}/{{project_name}}.dart' as native;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('FFI Example')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Version: ${native.version()}'),
              Text('5 + 3 = ${native.add(5, 3)}'),
              Text('5 * 3 = ${native.multiply(5, 3)}'),
              Text(native.greet('Flutter')),
              Builder(builder: (context) {
                final p1 = native.Point(0, 0);
                final p2 = native.Point(3, 4);
                return Text('Distance: ${p1.distanceTo(p2)}');
              }),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 9. Test the Project

```bash
# Get dependencies
flutter pub get

# Generate bindings
dart run ffigen

# Run example
cd example
flutter run
```

### 10. Output Summary

```
FFI Project Created
===================

Project: {{project_name}}
Organization: {{org}}
Language: C
Platforms: ios, android, macos, windows, linux

Created Files:
- lib/{{project_name}}.dart (public API)
- lib/{{project_name}}_bindings_generated.dart (FFI bindings)
- src/{{project_name}}.h (C header)
- src/{{project_name}}.c (C implementation)
- ffigen.yaml (binding generator config)

Next Steps:
1. Edit src/{{project_name}}.h to define your native API
2. Implement functions in src/{{project_name}}.c
3. Run `dart run ffigen` to regenerate bindings
4. Update lib/{{project_name}}.dart with Dart wrappers
5. Test with `cd example && flutter run`
```

## Agent Reference

For FFI implementation patterns, consult the `flutter-ffi-native` agent.
