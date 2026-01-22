# /flutter-firebase-init

Initialize Firebase in a Flutter project using FlutterFire CLI.

## Usage

```
/flutter-firebase-init [options]
```

## Options

- `--project <id>`: Firebase project ID
- `--platforms <list>`: Target platforms (ios,android,macos,web)
- `--env <name>`: Environment name (dev, staging, prod)
- `--multi-env`: Set up multiple environments

## Examples

```
/flutter-firebase-init
/flutter-firebase-init --project my-app-prod
/flutter-firebase-init --platforms ios,android,macos
/flutter-firebase-init --multi-env
```

## Instructions

When the user invokes `/flutter-firebase-init`, follow these steps:

### 1. Check Prerequisites

```bash
# Check Firebase CLI
firebase --version || npm install -g firebase-tools

# Check FlutterFire CLI
dart pub global list | grep flutterfire || dart pub global activate flutterfire_cli

# Ensure Firebase login
firebase login
```

### 2. Add Firebase Dependencies

```bash
flutter pub add firebase_core
```

```yaml
# pubspec.yaml additions
dependencies:
  firebase_core: ^2.27.0
```

### 3. Configure Firebase

```bash
# Basic configuration
flutterfire configure

# With specific project
flutterfire configure --project={{project_id}}

# With specific platforms
flutterfire configure --platforms=ios,android,macos,web

# With custom output
flutterfire configure --out=lib/firebase_options.dart
```

### 4. Multi-Environment Setup (if --multi-env)

```bash
# Development
flutterfire configure \
  --project={{project}}-dev \
  --out=lib/firebase_options_dev.dart \
  --ios-bundle-id=com.example.app.dev \
  --android-app-id=com.example.app.dev

# Staging
flutterfire configure \
  --project={{project}}-staging \
  --out=lib/firebase_options_staging.dart \
  --ios-bundle-id=com.example.app.staging \
  --android-app-id=com.example.app.staging

# Production
flutterfire configure \
  --project={{project}}-prod \
  --out=lib/firebase_options_prod.dart \
  --ios-bundle-id=com.example.app \
  --android-app-id=com.example.app
```

### 5. Create Firebase Initialization Code

```dart
// lib/core/firebase/firebase_initializer.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import '../firebase_options.dart';

class FirebaseInitializer {
  static Future<void> initialize() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    if (kDebugMode) {
      // Optional: Use emulators in debug mode
      // await _connectToEmulators();
    }
  }

  static Future<void> _connectToEmulators() async {
    // Uncomment to use Firebase emulators
    // await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
    // FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
    // await FirebaseStorage.instance.useStorageEmulator('localhost', 9199);
  }
}
```

### 6. Multi-Environment Initialization

```dart
// lib/core/firebase/firebase_config.dart
import 'package:firebase_core/firebase_core.dart';
import '../firebase_options_dev.dart' as dev;
import '../firebase_options_staging.dart' as staging;
import '../firebase_options_prod.dart' as prod;

enum AppEnvironment { development, staging, production }

class FirebaseConfig {
  static Future<void> initialize(AppEnvironment env) async {
    final options = switch (env) {
      AppEnvironment.development => dev.DefaultFirebaseOptions.currentPlatform,
      AppEnvironment.staging => staging.DefaultFirebaseOptions.currentPlatform,
      AppEnvironment.production => prod.DefaultFirebaseOptions.currentPlatform,
    };

    await Firebase.initializeApp(options: options);
  }
}
```

### 7. Create Entry Points (Multi-Environment)

```dart
// lib/main_dev.dart
import 'package:flutter/material.dart';
import 'core/firebase/firebase_config.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseConfig.initialize(AppEnvironment.development);
  runApp(const App());
}

// lib/main_staging.dart
import 'package:flutter/material.dart';
import 'core/firebase/firebase_config.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseConfig.initialize(AppEnvironment.staging);
  runApp(const App());
}

// lib/main_prod.dart (or lib/main.dart)
import 'package:flutter/material.dart';
import 'core/firebase/firebase_config.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseConfig.initialize(AppEnvironment.production);
  runApp(const App());
}
```

### 8. Update main.dart

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      home: const HomePage(),
    );
  }
}
```

### 9. Platform-Specific Configuration

#### Android

Verify `android/app/build.gradle`:
```groovy
apply plugin: 'com.google.gms.google-services'

android {
    defaultConfig {
        minSdkVersion 21  // Firebase requires API 21+
    }
}
```

Verify `android/build.gradle`:
```groovy
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.1'
    }
}
```

#### iOS

Verify `ios/Podfile`:
```ruby
platform :ios, '13.0'  # Firebase requires iOS 13+
```

#### macOS

Add entitlements for network access:
```xml
<!-- macos/Runner/DebugProfile.entitlements -->
<key>com.apple.security.network.client</key>
<true/>
```

### 10. Verify Setup

```bash
# Run the app
flutter run

# Check Firebase initialization
flutter logs | grep -i firebase
```

### 11. Output Summary

```
Firebase Initialization Complete
================================

Project: {{project_id}}
Platforms: ios, android, macos, web

Generated Files:
- lib/firebase_options.dart
- android/app/google-services.json
- ios/Runner/GoogleService-Info.plist
- macos/Runner/GoogleService-Info.plist

Dependencies Added:
- firebase_core: ^2.27.0

Configuration:
- Android: minSdkVersion 21
- iOS: platform 13.0
- macOS: network entitlements added

Next Steps:
1. Run `flutter pub get`
2. Add more Firebase packages as needed:
   - firebase_auth (authentication)
   - cloud_firestore (database)
   - firebase_storage (file storage)
   - firebase_messaging (push notifications)
3. Test with `flutter run`
```

## Agent Reference

For Firebase configuration details, consult the `flutter-firebase-core` agent.
