---
name: flutter-platform-setup
description: Configure platform-specific settings for iOS, Android, macOS, Windows, or Linux
arguments:
  - name: platform
    description: Target platform to configure
    required: true
    type: choice
    options: [ios, android, macos, windows, linux, all]
  - name: permissions
    description: Comma-separated list of permissions to add (camera, photos, microphone, location, contacts, calendar, bluetooth, biometrics, notifications, network)
    type: string
    required: false
  - name: signing
    description: Set up code signing configuration
    type: boolean
    default: false
  - name: icons
    description: Generate app icons using flutter_launcher_icons
    type: boolean
    default: false
agents:
  - flutter-ios-platform
  - flutter-android-platform
  - flutter-macos-platform
  - flutter-windows-platform
  - flutter-linux-platform
---

# Flutter Platform Setup Command

Configure platform-specific settings for iOS, Android, macOS, Windows, or Linux.

## Usage

```
/flutter-platform-setup <platform> [options]
```

## Platforms

- `ios`: iOS configuration
- `android`: Android configuration
- `macos`: macOS configuration
- `windows`: Windows configuration
- `linux`: Linux configuration
- `all`: Configure all platforms

## Options

- `--permissions <list>`: Add required permissions (comma-separated)
- `--signing`: Set up code signing
- `--icons`: Generate app icons

> **Note:** For splash screen configuration, use the dedicated `/flutter-splash` skill.
> For deep linking setup, use the dedicated `/flutter-deeplinks` skill.

## Examples

```
/flutter-platform-setup ios --permissions camera,photos
/flutter-platform-setup android --signing
/flutter-platform-setup macos --permissions network
/flutter-platform-setup all --icons
/flutter-platform-setup ios --permissions camera,microphone,location --signing
```

## iOS Configuration

### Permissions (Info.plist)

```xml
<!-- ios/Runner/Info.plist -->

<!-- Camera -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos</string>

<!-- Photo Library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs permission to save photos</string>

<!-- Microphone -->
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record audio</string>

<!-- Location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby places</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs location access to track your position</string>

<!-- Contacts -->
<key>NSContactsUsageDescription</key>
<string>This app needs contacts access</string>

<!-- Calendar -->
<key>NSCalendarsUsageDescription</key>
<string>This app needs calendar access</string>

<!-- Bluetooth -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app needs Bluetooth access</string>

<!-- Face ID -->
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for authentication</string>
```

### Entitlements

```xml
<!-- ios/Runner/Runner.entitlements -->
<key>aps-environment</key>
<string>development</string>

<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

### Code Signing

When `--signing` is specified for iOS:

1. Creates or updates `ios/ExportOptions.plist`
2. Configures signing in `ios/Runner.xcodeproj/project.pbxproj`
3. Sets up automatic signing team selection

```xml
<!-- ios/ExportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

## Android Configuration

### Permissions (AndroidManifest.xml)

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

<!-- Camera -->
<uses-permission android:name="android.permission.CAMERA"/>
<uses-feature android:name="android.hardware.camera" android:required="false"/>

<!-- Storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>

<!-- Location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>

<!-- Microphone -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>

<!-- Bluetooth -->
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE"/>

<!-- Biometrics -->
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
```

### Network Security

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

### Code Signing

When `--signing` is specified for Android:

1. Creates `android/key.properties` template
2. Updates `android/app/build.gradle` with signing config

```properties
# android/key.properties
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=upload
storeFile=<path-to-keystore>
```

```gradle
// android/app/build.gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

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
        }
    }
}
```

## macOS Configuration

### Entitlements

```xml
<!-- macos/Runner/Release.entitlements -->
<key>com.apple.security.app-sandbox</key>
<true/>

<key>com.apple.security.network.client</key>
<true/>

<key>com.apple.security.files.user-selected.read-write</key>
<true/>

<key>com.apple.security.device.camera</key>
<true/>

<key>com.apple.security.device.microphone</key>
<true/>
```

### Info.plist Permissions

```xml
<!-- macos/Runner/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access</string>

<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access</string>
```

## Windows Configuration

### App Manifest

```xml
<!-- windows/runner/runner.exe.manifest -->
<assembly>
  <application>
    <windowsSettings>
      <dpiAwareness>PerMonitorV2</dpiAwareness>
    </windowsSettings>
  </application>
</assembly>
```

### MSIX Capabilities

```yaml
# pubspec.yaml
msix_config:
  capabilities: internetClient, microphone, webcam, location
```

## Linux Configuration

### Desktop Entry

```desktop
# linux/packaging/myapp.desktop
[Desktop Entry]
Name=MyApp
Exec=myapp %U
Icon=myapp
Terminal=false
Type=Application
Categories=Utility;Application;
MimeType=x-scheme-handler/myapp;
```

## App Icons Generation

When `--icons` is specified:

```bash
# Install flutter_launcher_icons
flutter pub add dev:flutter_launcher_icons
```

```yaml
# flutter_launcher_icons.yaml or pubspec.yaml
flutter_launcher_icons:
  android: true
  ios: true
  macos: true
  windows: true
  linux: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#ffffff"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"
```

```bash
# Generate icons
dart run flutter_launcher_icons
```

## Execution Steps

When `/flutter-platform-setup` is invoked:

1. Parse platform and options
2. Validate platform directory exists
3. Add requested permissions to platform config files
4. Configure code signing if requested
5. Generate app icons if requested
6. Output summary of changes

## Output Summary

```
Platform Configuration Complete
================================

Platform: {{platform}}

Permissions Added:
- Camera ✓
- Photo Library ✓
- Microphone ✓
- Location ✓

Files Modified:
- ios/Runner/Info.plist
- ios/Runner/Runner.entitlements
- android/app/src/main/AndroidManifest.xml
- android/app/src/main/res/xml/network_security_config.xml

Icons Generated:
- iOS: All sizes ✓
- Android: All densities ✓
- Adaptive icons ✓

Next Steps:
1. Test permissions on device
2. Update permission descriptions with app-specific text
3. For signing, replace placeholder values in key.properties
```

## Related Skills

For additional platform configuration tasks, use these dedicated skills:

- **Splash Screen**: Use `/flutter-splash` to configure native splash screens
- **Deep Links**: Use `/flutter-deeplinks` to set up URL scheme and universal/app links
- **Flavors**: Use `/flutter-flavors` to set up build flavors for different environments

## Validation

The command validates the following before execution:

- **Platform directory**: Verifies the platform directory exists (e.g., `ios/`, `android/`)
- **Flutter project**: Confirms `pubspec.yaml` exists
- **Icon source**: If `--icons`, checks that source image exists at specified path
- **Permission names**: Validates permission names are recognized

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Platform not found | Platform directory doesn't exist | Run `flutter create --platforms=<platform> .` |
| Invalid permission | Unrecognized permission name | Check supported permissions list |
| Icon source missing | Icon image file not found | Create icon at `assets/icons/app_icon.png` |
| Signing config failed | Missing Xcode project files | Ensure iOS project is properly configured |
| Entitlements missing | Runner.entitlements file not found | Create entitlements file in Xcode |

## Agent Reference

For platform-specific guidance:

- **iOS**: Consult the `flutter-ios-platform` agent for iOS-specific configuration, App Store submission, and TestFlight setup
- **Android**: Consult the `flutter-android-platform` agent for Android-specific configuration, Play Store requirements, and ProGuard rules
- **macOS**: Consult the `flutter-macos-platform` agent for macOS sandbox configuration, notarization, and Mac App Store submission
- **Windows**: Consult the `flutter-windows-platform` agent for Windows packaging, MSIX configuration, and Microsoft Store submission
- **Linux**: Consult the `flutter-linux-platform` agent for Linux packaging (Snap, Flatpak, AppImage) and distribution
