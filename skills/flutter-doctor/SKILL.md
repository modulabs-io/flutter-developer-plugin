# /flutter-doctor

Run environment diagnostics, check dependencies, and identify configuration issues.

## Usage

```
/flutter-doctor [options]
```

## Options

- `--verbose` or `-v`: Show detailed diagnostic information
- `--android`: Check only Android configuration
- `--ios`: Check only iOS configuration
- `--check-pub`: Check for outdated packages
- `--check-tools`: Check development tools (VS Code, Android Studio)

## Examples

```
/flutter-doctor
/flutter-doctor --verbose
/flutter-doctor --android
/flutter-doctor --check-pub
```

## Instructions

When the user invokes `/flutter-doctor`, follow these steps:

### 1. Run Flutter Doctor

```bash
# Basic check
flutter doctor

# Verbose output
flutter doctor -v
```

### 2. Parse Output Categories

Flutter doctor checks:

```
[✓] Flutter (Channel stable, 3.x.x)
[✓] Android toolchain - develop for Android devices
[✓] Xcode - develop for iOS and macOS
[✓] Chrome - develop for the web
[✓] Android Studio
[✓] VS Code
[✓] Connected device
[✓] Network resources
```

### 3. Common Issues and Fixes

#### Flutter SDK Issues

```bash
# Issue: Flutter not found
# Fix: Add Flutter to PATH
export PATH="$PATH:$HOME/flutter/bin"

# Issue: Outdated Flutter
flutter upgrade

# Issue: Corrupted SDK
flutter doctor --verbose
rm -rf $HOME/flutter
git clone https://github.com/flutter/flutter.git -b stable
```

#### Android Toolchain Issues

```bash
# Issue: Android licenses not accepted
flutter doctor --android-licenses

# Issue: Android SDK not found
# Fix: Install via Android Studio or command line
sdkmanager "platforms;android-34" "build-tools;34.0.0"

# Issue: cmdline-tools component is missing
sdkmanager --install "cmdline-tools;latest"

# Issue: ANDROID_HOME not set
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Xcode Issues (macOS)

```bash
# Issue: Xcode not installed
xcode-select --install

# Issue: Xcode license not accepted
sudo xcodebuild -license accept

# Issue: CocoaPods not installed
sudo gem install cocoapods

# Issue: CocoaPods out of date
sudo gem install cocoapods
pod setup
```

#### VS Code Issues

```bash
# Issue: Flutter extension not installed
code --install-extension Dart-Code.flutter

# Issue: Dart extension not installed
code --install-extension Dart-Code.dart-code
```

### 4. Project-Specific Checks

#### Check pubspec.yaml

```bash
# Verify dependencies resolve
flutter pub get

# Check for outdated packages
flutter pub outdated

# Check for dependency issues
flutter pub deps
```

#### Analyze Problems

```yaml
common_issues:
  - issue: "version solving failed"
    cause: "Incompatible dependency versions"
    fix: |
      1. Check flutter pub outdated
      2. Update constraints in pubspec.yaml
      3. Try flutter pub upgrade --major-versions

  - issue: "Could not find package"
    cause: "Package doesn't exist or typo in name"
    fix: |
      1. Verify package name on pub.dev
      2. Check for typos
      3. Ensure internet connectivity

  - issue: "SDK constraints don't match"
    cause: "Project requires different SDK version"
    fix: |
      1. Update environment in pubspec.yaml
      2. Or switch Flutter channel
```

### 5. Platform Configuration Checks

#### Android Checks

```bash
# Check installed Android SDK components
sdkmanager --list_installed

# Verify build tools
ls $ANDROID_HOME/build-tools/

# Check emulators
emulator -list-avds
```

Required components:
- Android SDK Platform (matching compileSdkVersion)
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android Emulator (for testing)

#### iOS Checks (macOS)

```bash
# Check Xcode version
xcodebuild -version

# Check available simulators
xcrun simctl list devices

# Verify CocoaPods
pod --version

# Check signing identities
security find-identity -v -p codesigning
```

#### Desktop Checks

```bash
# macOS: Check Xcode command line tools
xcode-select -p

# Windows: Check Visual Studio
where devenv

# Linux: Check required libraries
dpkg -l | grep -E "cmake|ninja|clang|gtk"
```

### 6. Network Checks

```bash
# Check pub.dev connectivity
curl -I https://pub.dev

# Check Google services (for Firebase)
curl -I https://firebase.google.com

# Check GitHub (for git dependencies)
curl -I https://github.com
```

### 7. Device Checks

```bash
# List connected devices
flutter devices

# Check specific device
flutter devices -d {{device_id}}

# Android: Check ADB
adb devices

# iOS: Check iOS devices
xcrun xctrace list devices
```

### 8. Environment Variables Check

Required environment variables:

```bash
# Check all relevant env vars
echo "FLUTTER_ROOT: $FLUTTER_ROOT"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo "JAVA_HOME: $JAVA_HOME"
echo "PATH includes flutter: $(echo $PATH | grep -o flutter)"
```

### 9. Project Health Check

```bash
# Full project analysis
flutter analyze

# Check for deprecated APIs
dart fix --dry-run

# Verify project structure
test -f pubspec.yaml && echo "pubspec.yaml ✓"
test -d lib && echo "lib/ ✓"
test -d test && echo "test/ ✓"
test -f analysis_options.yaml && echo "analysis_options.yaml ✓"
```

### 10. Generate Report

```
Flutter Doctor Report
=====================

Flutter Installation
--------------------
Channel: stable
Version: 3.20.0
Dart: 3.3.0
Path: /Users/user/flutter

Android Toolchain
-----------------
SDK: /Users/user/Android/Sdk
Platform: android-34
Build Tools: 34.0.0
Licenses: Accepted ✓

iOS Toolchain (macOS)
---------------------
Xcode: 15.2
CocoaPods: 1.14.3
Signing: 2 identities found

Development Tools
-----------------
Android Studio: 2023.2.1
VS Code: 1.86.0
  - Flutter extension: ✓
  - Dart extension: ✓

Project Health
--------------
Dependencies: 45 packages
Outdated: 3 packages (minor updates)
Analysis issues: 0 errors, 2 warnings

Connected Devices
-----------------
- iPhone 15 Pro (simulator)
- Pixel 7 (physical)
- macOS (desktop)
- Chrome (web)

Network
-------
pub.dev: ✓
firebase.google.com: ✓

Recommendations
---------------
1. Update 3 outdated packages: /flutter-pub outdated
2. Consider upgrading Xcode to 15.3
3. Run `flutter doctor --android-licenses` to accept new licenses
```

## Troubleshooting Guide

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Unable to locate Android SDK` | SDK not installed or ANDROID_HOME not set | Install SDK via Android Studio, set ANDROID_HOME |
| `Xcode installation is incomplete` | Missing command line tools | Run `xcode-select --install` |
| `cocoapods not installed` | CocoaPods missing | Run `sudo gem install cocoapods` |
| `No connected devices` | No emulators/devices available | Start emulator or connect device |
| `pub get failed` | Network or dependency issue | Check internet, review pubspec.yaml |

## Agent Reference

For platform-specific issues:
- iOS: Consult `flutter-ios-platform` agent
- Android: Consult `flutter-android-platform` agent
- macOS: Consult `flutter-macos-platform` agent
- Windows: Consult `flutter-windows-platform` agent
- Linux: Consult `flutter-linux-platform` agent
