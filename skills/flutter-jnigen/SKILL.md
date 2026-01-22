# /flutter-jnigen

Generate Dart bindings for Java/Kotlin classes using jnigen.

## Usage

```
/flutter-jnigen [options]
```

## Options

- `--config <file>`: Config file path (default: jnigen.yaml)
- `--class <name>`: Generate for specific class
- `--init`: Create initial jnigen.yaml configuration
- `--summarize`: Generate API summary first

## Examples

```
/flutter-jnigen
/flutter-jnigen --config custom_jnigen.yaml
/flutter-jnigen --class com.example.MyClass
/flutter-jnigen --init
```

## Instructions

When the user invokes `/flutter-jnigen`, follow these steps:

### 1. Verify Dependencies

```yaml
# pubspec.yaml
dependencies:
  jni: ^0.7.0

dev_dependencies:
  jnigen: ^0.7.0
```

```bash
flutter pub add jni
flutter pub add --dev jnigen
flutter pub get
```

### 2. Initialize Configuration (--init)

Create `jnigen.yaml`:

```yaml
# jnigen.yaml
# See https://pub.dev/packages/jnigen for options

# Output configuration
output:
  bindings_type: dart_only  # dart_only, c_based
  dart:
    path: lib/src/android/
    structure: single_file  # single_file, package_structure

# Source paths
source_path:
  - 'android/src/main/java'
  - 'android/src/main/kotlin'

# Classes to generate bindings for
classes:
  - 'com.example.myapp.NativeHelper'
  - 'com.example.myapp.utils.*'  # Wildcard for package

# Android SDK classes (commonly used)
android_sdk_config:
  add_gradle_deps: true
  versions:
    - 'android-34'

# Exclude patterns
exclude:
  - '**/*Test*'
  - '**/*Internal*'
  - '**/BuildConfig'

# Maven dependencies (for third-party libraries)
# maven_downloads:
#   source_deps:
#     - 'com.google.code.gson:gson:2.10.1'

# Summarizer options (for preview)
summarizer:
  backend: auto  # auto, asm, doclet

# Logging
log_level: info
```

### 3. Create Java Class to Expose

```java
// android/src/main/java/com/example/myapp/NativeHelper.java
package com.example.myapp;

import android.content.Context;
import android.os.Build;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper class for native operations.
 */
public class NativeHelper {
    private static NativeHelper instance;
    private final Context context;
    private int counter;

    /**
     * Creates a new NativeHelper instance.
     * @param context Android context
     */
    public NativeHelper(Context context) {
        this.context = context;
        this.counter = 0;
    }

    /**
     * Get singleton instance.
     */
    public static synchronized NativeHelper getInstance(Context context) {
        if (instance == null) {
            instance = new NativeHelper(context.getApplicationContext());
        }
        return instance;
    }

    /**
     * Get device info.
     * @return Device information string
     */
    public String getDeviceInfo() {
        return String.format("Device: %s %s (API %d)",
            Build.MANUFACTURER,
            Build.MODEL,
            Build.VERSION.SDK_INT);
    }

    /**
     * Increment counter.
     * @return New counter value
     */
    public int incrementCounter() {
        return ++counter;
    }

    /**
     * Get current counter value.
     */
    public int getCounter() {
        return counter;
    }

    /**
     * Process a list of strings.
     * @param items Input items
     * @return Processed items
     */
    public List<String> processItems(List<String> items) {
        List<String> result = new ArrayList<>();
        for (String item : items) {
            result.add(item.toUpperCase());
        }
        return result;
    }

    /**
     * Callback interface for async operations.
     */
    public interface Callback {
        void onSuccess(String result);
        void onError(String error);
    }

    /**
     * Perform async operation.
     */
    public void performAsync(String input, Callback callback) {
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                callback.onSuccess("Processed: " + input);
            } catch (Exception e) {
                callback.onError(e.getMessage());
            }
        }).start();
    }
}
```

### 4. Run jnigen

```bash
# Generate API summary first (optional but recommended)
dart run jnigen --summarize

# Generate bindings
dart run jnigen
```

### 5. Generated Code Structure

```dart
// lib/src/android/native_helper.dart (generated)

// ignore_for_file: type=lint
import 'package:jni/jni.dart';

/// Helper class for native operations.
class NativeHelper extends JObject {
  @override
  late final JObjType<NativeHelper> $type = type;

  NativeHelper.fromRef(super.ref) : super.fromRef();

  static final _class = JClass.forName('com/example/myapp/NativeHelper');

  /// The type which includes information such as the signature of this class.
  static final type = $NativeHelperType();

  /// Creates a new NativeHelper instance.
  factory NativeHelper(Context context) {
    return NativeHelper.fromRef(
      _class.constructorId('(Landroid/content/Context;)V',
        [context.reference]).object(const JObjectType())
    );
  }

  static final _getInstance = _class.staticMethodId(
    'getInstance',
    '(Landroid/content/Context;)Lcom/example/myapp/NativeHelper;',
  );

  /// Get singleton instance.
  static NativeHelper getInstance(Context context) {
    return NativeHelper.fromRef(
      _getInstance([context.reference]).object(const JObjectType())
    );
  }

  static final _getDeviceInfo = _class.instanceMethodId(
    'getDeviceInfo',
    '()Ljava/lang/String;',
  );

  /// Get device info.
  String getDeviceInfo() {
    return _getDeviceInfo(this, []).object(const JStringType()).toDartString();
  }

  static final _incrementCounter = _class.instanceMethodId(
    'incrementCounter',
    '()I',
  );

  /// Increment counter.
  int incrementCounter() {
    return _incrementCounter(this, []).integer;
  }

  static final _getCounter = _class.instanceMethodId(
    'getCounter',
    '()I',
  );

  /// Get current counter value.
  int getCounter() {
    return _getCounter(this, []).integer;
  }

  // ... more methods
}

class $NativeHelperType extends JObjType<NativeHelper> {
  @override
  NativeHelper fromRef(JObjectPtr ref) => NativeHelper.fromRef(ref);

  @override
  String get signature => 'Lcom/example/myapp/NativeHelper;';
}
```

### 6. Use Generated Bindings

```dart
// lib/src/native_service.dart
import 'package:flutter/services.dart';
import 'package:jni/jni.dart';
import 'android/native_helper.dart';

class NativeService {
  NativeHelper? _helper;

  Future<void> initialize() async {
    // Get Android context
    final context = await _getApplicationContext();
    _helper = NativeHelper.getInstance(context);
  }

  String getDeviceInfo() {
    return _helper?.getDeviceInfo() ?? 'Not initialized';
  }

  int incrementCounter() {
    return _helper?.incrementCounter() ?? 0;
  }

  Future<Context> _getApplicationContext() async {
    // Use platform channel or existing JNI context
    // This depends on your app setup
    throw UnimplementedError('Implement context retrieval');
  }

  void dispose() {
    _helper?.release();
    _helper = null;
  }
}
```

### 7. Handle Callbacks

```dart
// Implementing Java interface in Dart
class DartCallback extends JObject implements NativeHelper_Callback {
  final void Function(String) onSuccessCallback;
  final void Function(String) onErrorCallback;

  DartCallback({
    required this.onSuccessCallback,
    required this.onErrorCallback,
  }) : super.fromRef(_createInstance());

  static JObjectPtr _createInstance() {
    // Create proxy implementation
    return JObject.fromRef(
      Jni.newDartProxyInstance(
        NativeHelper_Callback.$type.signature,
        {
          'onSuccess': (args) {
            // Handle callback
          },
          'onError': (args) {
            // Handle callback
          },
        },
      ),
    );
  }

  @override
  void onSuccess(JString result) {
    onSuccessCallback(result.toDartString());
  }

  @override
  void onError(JString error) {
    onErrorCallback(error.toDartString());
  }
}
```

### 8. Working with Collections

```dart
// Convert Dart list to Java List
List<String> processItems(List<String> items) {
  // Create Java ArrayList
  final javaList = JList.array(items.map((s) => s.toJString()).toList());

  // Call Java method
  final resultList = _helper!.processItems(javaList);

  // Convert back to Dart
  return resultList.toList().map((js) => js.toDartString()).toList();
}
```

### 9. Memory Management

```dart
// Always release JNI objects when done
void cleanup() {
  // Release individual objects
  _helper?.release();

  // Or use scope
  using((arena) {
    final helper = arena.add(NativeHelper.getInstance(context));
    final result = helper.getDeviceInfo();
    // helper automatically released when scope exits
  });
}
```

### 10. Output Summary

```
jnigen Complete
===============

Config: jnigen.yaml
Output: lib/src/android/

Generated classes:
- NativeHelper (15 methods, 2 constructors)
- NativeHelper.Callback (interface, 2 methods)

Generated from:
- android/src/main/java/com/example/myapp/NativeHelper.java

Dependencies:
- android.content.Context
- java.util.List

Warnings:
- Skipped internal method: internalProcess

Next Steps:
1. Review generated bindings in lib/src/android/
2. Create Dart wrapper for convenient API
3. Test on Android device/emulator
4. Handle JNI lifecycle (initialize/dispose)
```

## Platform Notes

- jnigen only works for **Android** platform
- Requires Android SDK and Java/Kotlin source files
- JNI must be initialized before using generated bindings
- Always release JNI objects to prevent memory leaks

## Agent Reference

For JNI implementation details, consult the `flutter-ffi-native` agent.
