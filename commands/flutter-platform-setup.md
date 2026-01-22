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

- `--permissions <list>`: Add required permissions
- `--signing`: Set up code signing
- `--deeplinks <scheme>`: Configure deep linking
- `--icons`: Generate app icons
- `--splash`: Configure splash screen

## Examples

```
/flutter-platform-setup ios --permissions camera,photos
/flutter-platform-setup android --signing --deeplinks myapp
/flutter-platform-setup macos --permissions network
/flutter-platform-setup all --icons
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

### Deep Links

```xml
<!-- ios/Runner/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>{{scheme}}</string>
        </array>
    </dict>
</array>

<!-- Universal Links -->
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:{{domain}}</string>
</array>
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

### Deep Links

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<activity android:name=".MainActivity">
    <!-- Deep Links -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="{{scheme}}" android:host="callback"/>
    </intent-filter>

    <!-- App Links -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="https" android:host="{{domain}}"/>
    </intent-filter>
</activity>
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

```bash
# Install flutter_launcher_icons
flutter pub add dev:flutter_launcher_icons

# Configure in pubspec.yaml
flutter_launcher_icons:
  android: true
  ios: true
  macos: true
  windows: true
  linux: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#ffffff"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

# Generate icons
dart run flutter_launcher_icons
```

## Splash Screen Configuration

```bash
# Install flutter_native_splash
flutter pub add dev:flutter_native_splash

# Configure in pubspec.yaml
flutter_native_splash:
  color: "#ffffff"
  image: assets/splash/splash_logo.png
  android: true
  ios: true
  android_12:
    color: "#ffffff"
    icon_background_color: "#ffffff"
    image: assets/splash/splash_logo.png

# Generate splash
dart run flutter_native_splash:create
```

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

Deep Links:
- Scheme: {{scheme}}://
- Universal Links: https://{{domain}}

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
2. Verify deep links work
3. Test universal links with apple-app-site-association
4. Verify assetlinks.json for Android App Links
```
