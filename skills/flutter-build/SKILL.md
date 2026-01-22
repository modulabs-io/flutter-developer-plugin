# /flutter-build

Build Flutter applications for any platform with proper signing and optimization.

## Usage

```
/flutter-build <platform> [options]
```

## Platforms

- `android`: Android APK or App Bundle
- `ios`: iOS application
- `macos`: macOS application
- `windows`: Windows application
- `linux`: Linux application
- `web`: Web application

## Options

### Common Options
- `--release`: Build in release mode (default)
- `--debug`: Build in debug mode
- `--profile`: Build in profile mode (for performance profiling)
- `--flavor <name>`: Build specific flavor/scheme
- `--target <file>`: Main entry point (default: lib/main.dart)
- `--dart-define <key=value>`: Define environment variables
- `--obfuscate`: Obfuscate Dart code (release only)
- `--split-debug-info <path>`: Split debug symbols

### Android-Specific
- `--apk`: Build APK (default)
- `--appbundle`: Build Android App Bundle (AAB)
- `--target-platform <arch>`: Target architecture (android-arm, android-arm64, android-x64)
- `--split-per-abi`: Split APK by ABI

### iOS-Specific
- `--no-codesign`: Skip code signing
- `--export-options-plist <file>`: Export options for archive

### Web-Specific
- `--web-renderer <renderer>`: canvaskit or html
- `--base-href <path>`: Base URL path

## Examples

```
/flutter-build android --release
/flutter-build android --appbundle --obfuscate
/flutter-build ios --release --flavor production
/flutter-build macos --release
/flutter-build windows --release
/flutter-build linux --release
/flutter-build web --release --web-renderer canvaskit
```

## Instructions

When the user invokes `/flutter-build`, follow these steps:

### 1. Verify Build Environment

```bash
# Check Flutter installation
flutter --version

# Check platform-specific tools
flutter doctor -v
```

### 2. Pre-Build Checks

```bash
# Ensure dependencies are up to date
flutter pub get

# Run analysis to catch issues
flutter analyze --no-fatal-infos

# Ensure generated code is up to date
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Platform-Specific Builds

#### Android Build

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Release APK split by ABI (smaller download size)
flutter build apk --release --split-per-abi

# Android App Bundle (recommended for Play Store)
flutter build appbundle --release

# With obfuscation (recommended for release)
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=build/app/outputs/symbols

# With flavor
flutter build apk --release --flavor production \
  --target lib/main_production.dart
```

**Android Signing Configuration** (`android/app/build.gradle`):
```groovy
android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### iOS Build

```bash
# Debug (no signing required)
flutter build ios --debug --no-codesign

# Release (requires signing)
flutter build ios --release

# With specific scheme/flavor
flutter build ios --release --flavor production

# Archive for App Store
flutter build ipa --release \
  --export-options-plist=ios/ExportOptions.plist

# With obfuscation
flutter build ipa --release \
  --obfuscate \
  --split-debug-info=build/ios/symbols
```

**iOS ExportOptions.plist**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

#### macOS Build

```bash
# Debug
flutter build macos --debug

# Release
flutter build macos --release

# With entitlements
# Ensure macos/Runner/Release.entitlements is configured
```

**macOS Entitlements** (`macos/Runner/Release.entitlements`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

#### Windows Build

```bash
# Debug
flutter build windows --debug

# Release
flutter build windows --release

# Output location: build/windows/x64/runner/Release/
```

**Windows Runner Configuration**:
- Application icon: `windows/runner/resources/app_icon.ico`
- Manifest: `windows/runner/runner.exe.manifest`

#### Linux Build

```bash
# Debug
flutter build linux --debug

# Release
flutter build linux --release

# Output location: build/linux/x64/release/bundle/
```

#### Web Build

```bash
# With CanvasKit renderer (better fidelity, larger size)
flutter build web --release --web-renderer canvaskit

# With HTML renderer (smaller, text selection support)
flutter build web --release --web-renderer html

# Auto-select renderer
flutter build web --release --web-renderer auto

# With base href for subdirectory deployment
flutter build web --release --base-href /my-app/

# Output location: build/web/
```

### 4. Environment Variables

Use `--dart-define` for build-time configuration:

```bash
flutter build apk --release \
  --dart-define=API_URL=https://api.production.com \
  --dart-define=FLAVOR=production \
  --dart-define=ENABLE_LOGGING=false
```

Access in Dart:
```dart
const apiUrl = String.fromEnvironment('API_URL');
const flavor = String.fromEnvironment('FLAVOR');
const enableLogging = bool.fromEnvironment('ENABLE_LOGGING');
```

Or use `.env` files with `flutter_dotenv`:
```bash
flutter build apk --release --dart-define-from-file=.env.production
```

### 5. Build Flavors/Variants

For multiple build configurations:

**Android** (`android/app/build.gradle`):
```groovy
flavorDimensions "environment"
productFlavors {
    development {
        dimension "environment"
        applicationIdSuffix ".dev"
        versionNameSuffix "-dev"
    }
    staging {
        dimension "environment"
        applicationIdSuffix ".staging"
        versionNameSuffix "-staging"
    }
    production {
        dimension "environment"
    }
}
```

**iOS** (Xcode schemes): Create schemes for each flavor.

### 6. Obfuscation and Symbol Files

For release builds, enable obfuscation:

```bash
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=build/symbols/android

flutter build ipa --release \
  --obfuscate \
  --split-debug-info=build/symbols/ios
```

Upload symbols to crash reporting services:
```bash
# Firebase Crashlytics
firebase crashlytics:symbols:upload \
  --app=1:123456789:android:abc123 \
  build/symbols/android

# Sentry
sentry-cli upload-dif build/symbols/
```

### 7. Build Verification

After building, verify:

```bash
# Check APK size and contents
unzip -l build/app/outputs/flutter-apk/app-release.apk

# Analyze APK
flutter build apk --analyze-size

# Check for debug symbols in release
flutter build apk --release && \
  strings build/app/outputs/flutter-apk/app-release.apk | grep -i "debug"
```

### 8. Output Summary

```
Build Complete
==============

Platform: Android
Mode: Release
Flavor: production

Output Files:
- APK: build/app/outputs/flutter-apk/app-production-release.apk (24.5 MB)
- AAB: build/app/outputs/bundle/productionRelease/app-production-release.aab (18.2 MB)
- Symbols: build/symbols/android/

Build Info:
- Version: 1.2.3+45
- Min SDK: 21
- Target SDK: 34
- Architectures: arm64-v8a, armeabi-v7a, x86_64

Next Steps:
1. Test on physical device: adb install <apk>
2. Upload to Play Console: Play Console > Release > Production
3. Upload symbols to Crashlytics for deobfuscation
```

## Platform-Specific Agents

For detailed platform guidance:
- iOS: Consult `flutter-ios-platform` agent
- Android: Consult `flutter-android-platform` agent
- macOS: Consult `flutter-macos-platform` agent
- Windows: Consult `flutter-windows-platform` agent
- Linux: Consult `flutter-linux-platform` agent
