# /flutter-ios-signing

Configure iOS code signing with certificates, provisioning profiles, and entitlements.

## Usage

```
/flutter-ios-signing [command] [options]
```

## Commands

- `setup`: Configure automatic signing
- `manual`: Set up manual signing
- `certificates`: List/manage certificates
- `profiles`: List/manage provisioning profiles
- `entitlements`: Configure app entitlements
- `export`: Export for distribution

## Options

- `--team <id>`: Apple Developer Team ID
- `--bundle-id <id>`: App bundle identifier
- `--type <type>`: development | distribution | enterprise

## Examples

```
/flutter-ios-signing setup --team ABC123XYZ
/flutter-ios-signing certificates
/flutter-ios-signing profiles --type distribution
/flutter-ios-signing entitlements
```

## Instructions

When the user invokes `/flutter-ios-signing`, follow these steps:

### 1. Check Current Signing Status

```bash
# View current signing configuration
cd ios
xcodebuild -showBuildSettings -scheme Runner | grep -E "(CODE_SIGN|PROVISIONING|DEVELOPMENT_TEAM)"

# List available signing identities
security find-identity -v -p codesigning
```

### 2. Automatic Signing Setup (Recommended)

Open Xcode and configure:

1. Open `ios/Runner.xcworkspace`
2. Select Runner project → Signing & Capabilities
3. Enable "Automatically manage signing"
4. Select your Team
5. Xcode creates certificates and profiles automatically

Or via `xcodebuild`:

```bash
xcodebuild \
  -workspace Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -allowProvisioningUpdates \
  archive
```

### 3. Manual Signing Setup

#### Create Certificate Signing Request (CSR)

```bash
# Generate private key and CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout ios_distribution.key \
  -out CertificateSigningRequest.certSigningRequest \
  -subj "/emailAddress=dev@example.com/CN=Your Name/C=US"
```

#### Download Certificate from Apple Developer Portal

1. Go to https://developer.apple.com/account
2. Certificates, Identifiers & Profiles
3. Create new certificate (iOS Distribution)
4. Upload CSR
5. Download certificate (.cer)

#### Install Certificate

```bash
# Convert .cer to .p12
openssl x509 -in ios_distribution.cer -inform DER -out ios_distribution.pem -outform PEM
openssl pkcs12 -export \
  -inkey ios_distribution.key \
  -in ios_distribution.pem \
  -out ios_distribution.p12

# Import to Keychain
security import ios_distribution.p12 -k ~/Library/Keychains/login.keychain-db -P "password" -T /usr/bin/codesign

# Verify installation
security find-identity -v -p codesigning
```

### 4. Provisioning Profiles

#### Create Profile in Developer Portal

1. Certificates, Identifiers & Profiles → Profiles
2. Create new profile:
   - **Development**: For testing on devices
   - **Ad Hoc**: For beta testing (up to 100 devices)
   - **App Store**: For App Store distribution
3. Select App ID and certificates
4. Download profile (.mobileprovision)

#### Install Profile

```bash
# Copy to Provisioning Profiles directory
cp MyApp_Distribution.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

# Or install via Xcode
open MyApp_Distribution.mobileprovision

# List installed profiles
ls ~/Library/MobileDevice/Provisioning\ Profiles/

# View profile details
security cms -D -i MyApp_Distribution.mobileprovision
```

### 5. Configure Xcode Project

#### Build Settings

```
// In Xcode → Build Settings
CODE_SIGN_STYLE = Manual
CODE_SIGN_IDENTITY = "Apple Distribution: Your Company (ABC123XYZ)"
PROVISIONING_PROFILE_SPECIFIER = "MyApp Distribution Profile"
DEVELOPMENT_TEAM = ABC123XYZ
```

#### Or via xcconfig

```
// ios/Flutter/Release.xcconfig
CODE_SIGN_STYLE=Manual
CODE_SIGN_IDENTITY=Apple Distribution: Your Company (ABC123XYZ)
PROVISIONING_PROFILE_SPECIFIER=MyApp Distribution Profile
DEVELOPMENT_TEAM=ABC123XYZ
```

### 6. Configure Entitlements

Create or edit entitlements file:

```xml
<!-- ios/Runner/Runner.entitlements -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Push Notifications -->
    <key>aps-environment</key>
    <string>production</string>

    <!-- App Groups (for sharing data between app and extensions) -->
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.example.myapp</string>
    </array>

    <!-- Associated Domains (Universal Links) -->
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:example.com</string>
        <string>webcredentials:example.com</string>
    </array>

    <!-- Sign in with Apple -->
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>

    <!-- Keychain Sharing -->
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.example.myapp</string>
    </array>

    <!-- HealthKit (if needed) -->
    <key>com.apple.developer.healthkit</key>
    <true/>
    <key>com.apple.developer.healthkit.access</key>
    <array/>

    <!-- iCloud -->
    <key>com.apple.developer.icloud-container-identifiers</key>
    <array>
        <string>iCloud.com.example.myapp</string>
    </array>
    <key>com.apple.developer.icloud-services</key>
    <array>
        <string>CloudDocuments</string>
        <string>CloudKit</string>
    </array>

    <!-- In-App Purchases -->
    <key>com.apple.developer.in-app-payments</key>
    <array>
        <string>merchant.com.example.myapp</string>
    </array>
</dict>
</plist>
```

### 7. CI/CD Signing Setup

#### Create Keychain (CI Environment)

```bash
# Create temporary keychain
KEYCHAIN_NAME="build.keychain"
KEYCHAIN_PASSWORD="ci_password"

security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security default-keychain -s "$KEYCHAIN_NAME"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security set-keychain-settings -t 3600 -u "$KEYCHAIN_NAME"

# Import certificate
security import certificate.p12 \
  -k "$KEYCHAIN_NAME" \
  -P "$CERT_PASSWORD" \
  -T /usr/bin/codesign

# Allow codesign access
security set-key-partition-list -S apple-tool:,apple: \
  -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
```

#### Install Provisioning Profile

```bash
# Decode base64 profile
echo "$PROVISIONING_PROFILE_BASE64" | base64 --decode > profile.mobileprovision

# Get UUID
PROFILE_UUID=$(security cms -D -i profile.mobileprovision | plutil -extract UUID raw -)

# Install profile
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/$PROFILE_UUID.mobileprovision
```

### 8. Export Options

Create ExportOptions.plist for different distribution methods:

#### App Store Distribution

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>ABC123XYZ</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

#### Ad Hoc Distribution

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>ABC123XYZ</string>
    <key>signingStyle</key>
    <string>manual</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.example.myapp</key>
        <string>MyApp Ad Hoc Profile</string>
    </dict>
</dict>
</plist>
```

### 9. Build and Archive

```bash
# Build IPA with Flutter
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist

# Or with xcodebuild
# Archive
xcodebuild \
  -workspace ios/Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -archivePath build/Runner.xcarchive \
  archive

# Export IPA
xcodebuild \
  -exportArchive \
  -archivePath build/Runner.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ios/ExportOptions.plist
```

### 10. Validate and Upload

```bash
# Validate archive
xcrun altool --validate-app \
  -f build/ipa/Runner.ipa \
  -t ios \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID

# Upload to App Store Connect
xcrun altool --upload-app \
  -f build/ipa/Runner.ipa \
  -t ios \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

### 11. Troubleshooting

```bash
# Check certificate validity
security find-certificate -a -c "Apple Distribution" -p | openssl x509 -noout -dates

# Check profile expiration
security cms -D -i profile.mobileprovision | grep -A1 ExpirationDate

# Reset all signing
# 1. Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# 2. Delete provisioning profiles
rm -rf ~/Library/MobileDevice/Provisioning\ Profiles/*

# 3. In Xcode: disable and re-enable automatic signing

# Verify entitlements in signed app
codesign -d --entitlements :- Runner.app
```

### 12. Output Summary

```
iOS Code Signing Configuration Complete
=======================================

Team: Your Company (ABC123XYZ)
Bundle ID: com.example.myapp
Signing Style: Automatic

Certificates:
✓ Apple Development: dev@example.com (expires: 2025-12-01)
✓ Apple Distribution: Your Company (expires: 2025-12-01)

Provisioning Profiles:
✓ MyApp Development (Development)
✓ MyApp Distribution (App Store)

Entitlements:
✓ Push Notifications
✓ Associated Domains
✓ Sign in with Apple

Export Options: ios/ExportOptions.plist

Next Steps:
1. Build: flutter build ipa --release
2. Upload: xcrun altool --upload-app
3. Complete App Store Connect submission
```

## Agent Reference

For iOS platform details, consult the `flutter-ios-platform` agent.
