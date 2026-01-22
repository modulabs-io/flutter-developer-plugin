# /flutter-macos-package

Create macOS distribution packages (DMG, PKG) with notarization.

## Usage

```
/flutter-macos-package [format] [options]
```

## Formats

- `dmg`: Create DMG disk image
- `pkg`: Create PKG installer
- `app`: Build signed .app bundle

## Options

- `--notarize`: Submit for Apple notarization
- `--sign`: Sign with Developer ID
- `--appstore`: Prepare for Mac App Store

## Examples

```
/flutter-macos-package dmg
/flutter-macos-package pkg --notarize
/flutter-macos-package app --sign
/flutter-macos-package --appstore
```

## Instructions

When the user invokes `/flutter-macos-package`, follow these steps:

### 1. Build Release

```bash
# Build macOS release
flutter build macos --release

# Output: build/macos/Build/Products/Release/MyApp.app
```

### 2. Create Signed App Bundle

```bash
# Check signing identity
security find-identity -v -p codesigning

# Sign the app (automatic with Xcode)
xcodebuild -workspace macos/Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -archivePath build/macos/Runner.xcarchive \
  archive

# Export signed app
xcodebuild -exportArchive \
  -archivePath build/macos/Runner.xcarchive \
  -exportPath build/macos/export \
  -exportOptionsPlist macos/ExportOptions.plist
```

### 3. ExportOptions.plist for Developer ID

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>developer-id</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

### 4. Create DMG

```bash
# Install create-dmg
brew install create-dmg

# Create DMG
create-dmg \
  --volname "MyApp" \
  --volicon "macos/Runner/Assets.xcassets/AppIcon.appiconset/app_icon_512.png" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "MyApp.app" 150 190 \
  --hide-extension "MyApp.app" \
  --app-drop-link 450 185 \
  --no-internet-enable \
  "build/macos/MyApp-1.0.0.dmg" \
  "build/macos/export/MyApp.app"

# Sign the DMG
codesign --force --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "build/macos/MyApp-1.0.0.dmg"
```

### 5. Create PKG Installer

```bash
# Create pkg installer
productbuild \
  --component "build/macos/export/MyApp.app" /Applications \
  --sign "Developer ID Installer: Your Name (TEAM_ID)" \
  "build/macos/MyApp-1.0.0.pkg"
```

### 6. Notarize for Distribution

```bash
# Store credentials (one time)
xcrun notarytool store-credentials "notary-profile" \
  --apple-id "your@email.com" \
  --team-id "TEAM_ID" \
  --password "app-specific-password"

# Submit for notarization
xcrun notarytool submit "build/macos/MyApp-1.0.0.dmg" \
  --keychain-profile "notary-profile" \
  --wait

# Or with explicit credentials
xcrun notarytool submit "build/macos/MyApp-1.0.0.dmg" \
  --apple-id "your@email.com" \
  --team-id "TEAM_ID" \
  --password "app-specific-password" \
  --wait

# Staple the notarization ticket
xcrun stapler staple "build/macos/MyApp-1.0.0.dmg"

# Verify
xcrun stapler validate "build/macos/MyApp-1.0.0.dmg"
spctl --assess --type open --context context:primary-signature -v "build/macos/MyApp-1.0.0.dmg"
```

### 7. Mac App Store Submission

```bash
# Create App Store export options
cat > macos/ExportOptions-AppStore.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

# Archive for App Store
xcodebuild -workspace macos/Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -archivePath build/macos/Runner.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/macos/Runner.xcarchive \
  -exportPath build/macos/appstore \
  -exportOptionsPlist macos/ExportOptions-AppStore.plist

# Validate
xcrun altool --validate-app \
  -f "build/macos/appstore/MyApp.pkg" \
  -t macos \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID

# Upload
xcrun altool --upload-app \
  -f "build/macos/appstore/MyApp.pkg" \
  -t macos \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

### 8. Automated Build Script

```bash
#!/bin/bash
# scripts/build_macos.sh

set -e

APP_NAME="MyApp"
VERSION="1.0.0"
TEAM_ID="YOUR_TEAM_ID"
APPLE_ID="your@email.com"

echo "Building macOS release..."
flutter build macos --release

echo "Archiving..."
xcodebuild -workspace macos/Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -archivePath build/macos/Runner.xcarchive \
  archive

echo "Exporting..."
xcodebuild -exportArchive \
  -archivePath build/macos/Runner.xcarchive \
  -exportPath build/macos/export \
  -exportOptionsPlist macos/ExportOptions.plist

echo "Creating DMG..."
create-dmg \
  --volname "$APP_NAME" \
  --window-size 600 400 \
  --icon "$APP_NAME.app" 150 190 \
  --app-drop-link 450 185 \
  "build/macos/$APP_NAME-$VERSION.dmg" \
  "build/macos/export/$APP_NAME.app"

echo "Signing DMG..."
codesign --force --sign "Developer ID Application: Your Name ($TEAM_ID)" \
  "build/macos/$APP_NAME-$VERSION.dmg"

echo "Notarizing..."
xcrun notarytool submit "build/macos/$APP_NAME-$VERSION.dmg" \
  --keychain-profile "notary-profile" \
  --wait

echo "Stapling..."
xcrun stapler staple "build/macos/$APP_NAME-$VERSION.dmg"

echo "Done! Package: build/macos/$APP_NAME-$VERSION.dmg"
```

### 9. Verify Package

```bash
# Verify app signature
codesign --verify --deep --strict "build/macos/export/MyApp.app"

# Check entitlements
codesign -d --entitlements :- "build/macos/export/MyApp.app"

# Gatekeeper check
spctl --assess --verbose "build/macos/export/MyApp.app"

# Check notarization status
xcrun stapler validate "build/macos/MyApp-1.0.0.dmg"
```

### 10. Troubleshooting

```bash
# Notarization log
xcrun notarytool log <submission-id> \
  --keychain-profile "notary-profile"

# Common issues:
# - Missing hardened runtime: Enable in Xcode
# - Missing timestamp: Sign with --timestamp
# - Invalid signature: Re-sign with --deep
# - Entitlement issues: Check Release.entitlements

# Reset code signing
codesign --force --deep --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "build/macos/export/MyApp.app"

# Clear Gatekeeper cache
sudo spctl --master-disable
sudo spctl --master-enable
```

### 11. Output Summary

```
macOS Package Created
=====================

App: MyApp
Version: 1.0.0

Build:
- Architecture: arm64, x86_64 (Universal)
- Signed: Developer ID Application
- Hardened Runtime: Enabled
- Sandbox: Enabled

Packages Created:
- build/macos/MyApp-1.0.0.dmg (45 MB)
- build/macos/MyApp-1.0.0.pkg (44 MB)

Notarization:
- Status: Approved
- Ticket: Stapled

Verification:
✓ Code signature valid
✓ Gatekeeper approved
✓ Notarization stapled

Distribution:
- Website: Upload DMG
- Mac App Store: Use xcrun altool

Next Steps:
1. Test on clean macOS installation
2. Upload to distribution channel
3. Update release notes
```

## Agent Reference

For macOS platform details, consult the `flutter-macos-platform` agent.
