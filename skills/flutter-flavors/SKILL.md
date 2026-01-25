# /flutter-flavors

Configure build flavors and environment-specific configurations for Flutter applications.

## Usage

```
/flutter-flavors <command> [options]
```

## Commands

- `init`: Initialize flavor configuration
- `add`: Add a new flavor
- `config`: Configure flavor-specific settings
- `assets`: Set up flavor-specific assets

## Options

- `--flavors <list>`: Flavor names (comma-separated)
- `--platform <platforms>`: Platforms to configure (android, ios, all)
- `--firebase`: Include Firebase configuration per flavor
- `--icons`: Generate flavor-specific app icons

## Examples

```
/flutter-flavors init --flavors dev,staging,prod
/flutter-flavors add --name qa --platform all
/flutter-flavors config --firebase
/flutter-flavors assets --icons
```

## Instructions

When the user invokes `/flutter-flavors`, follow these steps:

### 1. Project Structure

```
lib/
├── main_development.dart
├── main_staging.dart
├── main_production.dart
├── app.dart
├── config/
│   ├── app_config.dart
│   └── environment.dart
└── ...

android/
├── app/
│   ├── src/
│   │   ├── development/
│   │   │   └── res/values/strings.xml
│   │   ├── staging/
│   │   │   └── res/values/strings.xml
│   │   └── production/
│   │       └── res/values/strings.xml
│   └── build.gradle
└── ...

ios/
├── Runner/
│   ├── Configuration/
│   │   ├── Development.xcconfig
│   │   ├── Staging.xcconfig
│   │   └── Production.xcconfig
│   └── Info.plist
└── ...
```

### 2. Environment Configuration

**lib/config/environment.dart**:
```dart
enum Environment {
  development,
  staging,
  production,
}

class AppConfig {
  final Environment environment;
  final String appName;
  final String baseUrl;
  final bool enableLogging;
  final String? sentryDsn;

  const AppConfig({
    required this.environment,
    required this.appName,
    required this.baseUrl,
    this.enableLogging = false,
    this.sentryDsn,
  });

  static late AppConfig _instance;
  static AppConfig get instance => _instance;

  static void initialize(AppConfig config) {
    _instance = config;
  }

  bool get isDevelopment => environment == Environment.development;
  bool get isStaging => environment == Environment.staging;
  bool get isProduction => environment == Environment.production;

  // Development configuration
  static const development = AppConfig(
    environment: Environment.development,
    appName: 'MyApp Dev',
    baseUrl: 'https://api-dev.example.com',
    enableLogging: true,
  );

  // Staging configuration
  static const staging = AppConfig(
    environment: Environment.staging,
    appName: 'MyApp Staging',
    baseUrl: 'https://api-staging.example.com',
    enableLogging: true,
    sentryDsn: 'https://staging@sentry.io/123',
  );

  // Production configuration
  static const production = AppConfig(
    environment: Environment.production,
    appName: 'MyApp',
    baseUrl: 'https://api.example.com',
    enableLogging: false,
    sentryDsn: 'https://production@sentry.io/456',
  );
}
```

### 3. Entry Points

**lib/main_development.dart**:
```dart
import 'package:flutter/material.dart';
import 'config/environment.dart';
import 'app.dart';

void main() {
  AppConfig.initialize(AppConfig.development);
  runApp(const MyApp());
}
```

**lib/main_staging.dart**:
```dart
import 'package:flutter/material.dart';
import 'config/environment.dart';
import 'app.dart';

void main() {
  AppConfig.initialize(AppConfig.staging);
  runApp(const MyApp());
}
```

**lib/main_production.dart**:
```dart
import 'package:flutter/material.dart';
import 'config/environment.dart';
import 'app.dart';

void main() {
  AppConfig.initialize(AppConfig.production);
  runApp(const MyApp());
}
```

**lib/app.dart**:
```dart
import 'package:flutter/material.dart';
import 'config/environment.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.instance.appName,
      debugShowCheckedModeBanner: !AppConfig.instance.isProduction,
      home: const HomeScreen(),
    );
  }
}
```

### 4. Android Flavor Configuration

**android/app/build.gradle**:
```groovy
android {
    // ...

    flavorDimensions "environment"

    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "MyApp Dev"
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "MyApp Staging"
        }
        production {
            dimension "environment"
            resValue "string", "app_name", "MyApp"
        }
    }

    // Map Flutter flavor to Gradle flavor
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
```

**Flavor-specific resources**:

`android/app/src/development/res/values/strings.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MyApp Dev</string>
</resources>
```

`android/app/src/staging/res/values/strings.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MyApp Staging</string>
</resources>
```

`android/app/src/production/res/values/strings.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MyApp</string>
</resources>
```

### 5. iOS Scheme Configuration

**Create xcconfig files**:

`ios/Runner/Configuration/Development.xcconfig`:
```
#include "Pods/Target Support Files/Pods-Runner/Pods-Runner.debug.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER=com.example.app.dev
PRODUCT_NAME=MyApp Dev
DISPLAY_NAME=MyApp Dev
FLUTTER_TARGET=lib/main_development.dart
```

`ios/Runner/Configuration/Staging.xcconfig`:
```
#include "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER=com.example.app.staging
PRODUCT_NAME=MyApp Staging
DISPLAY_NAME=MyApp Staging
FLUTTER_TARGET=lib/main_staging.dart
```

`ios/Runner/Configuration/Production.xcconfig`:
```
#include "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER=com.example.app
PRODUCT_NAME=MyApp
DISPLAY_NAME=MyApp
FLUTTER_TARGET=lib/main_production.dart
```

**Update Info.plist**:
```xml
<key>CFBundleDisplayName</key>
<string>$(DISPLAY_NAME)</string>
<key>CFBundleName</key>
<string>$(PRODUCT_NAME)</string>
```

**Create Xcode schemes**:

1. Open `ios/Runner.xcworkspace` in Xcode
2. Product > Scheme > Manage Schemes
3. Duplicate "Runner" scheme for each flavor:
   - Runner-Development
   - Runner-Staging
   - Runner-Production
4. Edit each scheme's Build Configuration:
   - Development: Debug-Development / Release-Development
   - Staging: Debug-Staging / Release-Staging
   - Production: Debug-Production / Release-Production

### 6. Flavor-Specific Firebase Configuration

**Project structure**:
```
android/app/src/
├── development/
│   └── google-services.json
├── staging/
│   └── google-services.json
└── production/
    └── google-services.json

ios/Runner/
├── Firebase/
│   ├── Development/
│   │   └── GoogleService-Info.plist
│   ├── Staging/
│   │   └── GoogleService-Info.plist
│   └── Production/
│       └── GoogleService-Info.plist
```

**iOS Build Phase Script** (Run Script):
```bash
# Copy correct GoogleService-Info.plist based on configuration
CONFIG_PATH="${PROJECT_DIR}/Runner/Firebase/${CONFIGURATION}"
PLIST_DESTINATION="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"

if [ -f "${CONFIG_PATH}/GoogleService-Info.plist" ]; then
  cp "${CONFIG_PATH}/GoogleService-Info.plist" "${PLIST_DESTINATION}"
else
  echo "Error: GoogleService-Info.plist not found for configuration: ${CONFIGURATION}"
  exit 1
fi
```

### 7. Flavor-Specific App Icons

**Using flutter_launcher_icons**:

`flutter_launcher_icons-development.yaml`:
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/icon_dev.png"
  adaptive_icon_background: "#FFFFFF"
  adaptive_icon_foreground: "assets/icons/icon_dev_foreground.png"
```

`flutter_launcher_icons-staging.yaml`:
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/icon_staging.png"
```

`flutter_launcher_icons-production.yaml`:
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/icon_prod.png"
```

Generate icons:
```bash
flutter pub run flutter_launcher_icons -f flutter_launcher_icons-development.yaml
flutter pub run flutter_launcher_icons -f flutter_launcher_icons-staging.yaml
flutter pub run flutter_launcher_icons -f flutter_launcher_icons-production.yaml
```

### 8. Run and Build Commands

**Running**:
```bash
# Development
flutter run --flavor development --target lib/main_development.dart

# Staging
flutter run --flavor staging --target lib/main_staging.dart

# Production
flutter run --flavor production --target lib/main_production.dart
```

**Building**:
```bash
# Android
flutter build apk --flavor development --target lib/main_development.dart
flutter build apk --flavor staging --target lib/main_staging.dart
flutter build apk --flavor production --target lib/main_production.dart --release

# iOS
flutter build ios --flavor development --target lib/main_development.dart
flutter build ios --flavor staging --target lib/main_staging.dart
flutter build ios --flavor production --target lib/main_production.dart --release
```

### 9. IDE Run Configurations

**VS Code** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Development",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_development.dart",
      "args": ["--flavor", "development"]
    },
    {
      "name": "Staging",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_staging.dart",
      "args": ["--flavor", "staging"]
    },
    {
      "name": "Production",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_production.dart",
      "args": ["--flavor", "production"]
    }
  ]
}
```

**Android Studio** (Run/Debug Configurations):
1. Run > Edit Configurations
2. Add Flutter configuration for each flavor:
   - Name: Development
   - Dart entrypoint: lib/main_development.dart
   - Additional run args: --flavor development

### 10. Dart Define Alternative

For simpler cases without native flavor support:

```bash
# Run with dart-define
flutter run --dart-define=FLAVOR=development

# Build with dart-define
flutter build apk --dart-define=FLAVOR=production --dart-define=API_URL=https://api.example.com
```

Access in code:
```dart
const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'development');
const apiUrl = String.fromEnvironment('API_URL');

class AppConfig {
  static Environment get environment {
    switch (flavor) {
      case 'production':
        return Environment.production;
      case 'staging':
        return Environment.staging;
      default:
        return Environment.development;
    }
  }
}
```

**Using .env files** (`--dart-define-from-file`):

`.env.development`:
```
FLAVOR=development
API_URL=https://api-dev.example.com
ENABLE_LOGGING=true
```

```bash
flutter run --dart-define-from-file=.env.development
```

### 11. CI/CD with Flavors

**GitHub Actions example**:
```yaml
jobs:
  build:
    strategy:
      matrix:
        flavor: [development, staging, production]
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - run: flutter build apk --flavor ${{ matrix.flavor }} --target lib/main_${{ matrix.flavor }}.dart
```

### 12. Output Summary

```
Flavor Configuration Complete
=============================

Flavors Configured:
- development (com.example.app.dev)
- staging (com.example.app.staging)
- production (com.example.app)

Files Created:
- lib/main_development.dart
- lib/main_staging.dart
- lib/main_production.dart
- lib/config/environment.dart
- android/app/build.gradle (updated)
- ios/Runner/Configuration/*.xcconfig

Run Commands:
- flutter run --flavor development -t lib/main_development.dart
- flutter run --flavor staging -t lib/main_staging.dart
- flutter run --flavor production -t lib/main_production.dart

Build Commands:
- flutter build apk --flavor production -t lib/main_production.dart --release
- flutter build ios --flavor production -t lib/main_production.dart --release

Next Steps:
1. Create Xcode schemes for iOS
2. Add flavor-specific Firebase configs
3. Generate flavor-specific app icons
4. Update CI/CD pipelines
```

## Agent Reference

For architecture decisions around environment configuration, consult the `flutter-architect` agent. For platform-specific flavor setup, consult the `flutter-android-platform` and `flutter-ios-platform` agents.
