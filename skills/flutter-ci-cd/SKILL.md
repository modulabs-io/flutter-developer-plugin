# /flutter-ci-cd

Set up continuous integration and deployment pipelines for Flutter applications.

## Usage

```
/flutter-ci-cd <platform> [options]
```

## Platforms

- `github-actions`: GitHub Actions workflows
- `codemagic`: Codemagic CI/CD configuration
- `fastlane`: Fastlane automation for iOS/Android
- `gitlab`: GitLab CI configuration
- `bitrise`: Bitrise workflow configuration

## Options

- `--targets <platforms>`: Build targets (android, ios, web, macos, windows, linux)
- `--deploy`: Include deployment configuration
- `--testing`: Include test automation
- `--flavor <name>`: Configure for specific flavor
- `--signing`: Include code signing setup

## Examples

```
/flutter-ci-cd github-actions --targets android,ios --deploy
/flutter-ci-cd codemagic --targets android,ios --signing
/flutter-ci-cd fastlane --targets ios --deploy
/flutter-ci-cd github-actions --testing
```

## Instructions

When the user invokes `/flutter-ci-cd`, follow these steps:

### 1. GitHub Actions Setup

Create `.github/workflows/` directory structure:

**Build and Test Workflow** (`.github/workflows/ci.yml`):
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  FLUTTER_VERSION: '3.24.0'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze code
        run: flutter analyze --no-fatal-infos

      - name: Check formatting
        run: dart format --set-exit-if-changed .

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Get dependencies
        run: flutter pub get

      - name: Run tests with coverage
        run: flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: coverage/lcov.info
          fail_ci_if_error: true

  build-android:
    name: Build Android
    needs: [analyze, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Get dependencies
        run: flutter pub get

      - name: Build APK
        run: flutter build apk --release

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    name: Build iOS
    needs: [analyze, test]
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Get dependencies
        run: flutter pub get

      - name: Build iOS (no codesign)
        run: flutter build ios --release --no-codesign

      - name: Upload iOS build
        uses: actions/upload-artifact@v4
        with:
          name: ios-build
          path: build/ios/iphoneos/

  build-web:
    name: Build Web
    needs: [analyze, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Get dependencies
        run: flutter pub get

      - name: Build web
        run: flutter build web --release

      - name: Upload web build
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: build/web/
```

**Release Workflow** (`.github/workflows/release.yml`):
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  FLUTTER_VERSION: '3.24.0'

jobs:
  build-android-release:
    name: Build Android Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Decode keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 -d > android/app/keystore.jks

      - name: Create key.properties
        env:
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
        run: |
          cat > android/key.properties << EOF
          storePassword=$STORE_PASSWORD
          keyPassword=$KEY_PASSWORD
          keyAlias=$KEY_ALIAS
          storeFile=keystore.jks
          EOF

      - name: Get dependencies
        run: flutter pub get

      - name: Build App Bundle
        run: |
          flutter build appbundle --release \
            --obfuscate \
            --split-debug-info=build/symbols

      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
          packageName: com.example.app
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: internal
          mappingFile: build/app/outputs/mapping/release/mapping.txt

  build-ios-release:
    name: Build iOS Release
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install Apple certificate
        env:
          BUILD_CERTIFICATE_BASE64: ${{ secrets.IOS_BUILD_CERTIFICATE_BASE64 }}
          P12_PASSWORD: ${{ secrets.IOS_P12_PASSWORD }}
          BUILD_PROVISION_PROFILE_BASE64: ${{ secrets.IOS_PROVISION_PROFILE_BASE64 }}
          KEYCHAIN_PASSWORD: ${{ secrets.KEYCHAIN_PASSWORD }}
        run: |
          # Create variables
          CERTIFICATE_PATH=$RUNNER_TEMP/build_certificate.p12
          PP_PATH=$RUNNER_TEMP/build_pp.mobileprovision
          KEYCHAIN_PATH=$RUNNER_TEMP/app-signing.keychain-db

          # Import certificate and provisioning profile
          echo -n "$BUILD_CERTIFICATE_BASE64" | base64 --decode -o $CERTIFICATE_PATH
          echo -n "$BUILD_PROVISION_PROFILE_BASE64" | base64 --decode -o $PP_PATH

          # Create keychain
          security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
          security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
          security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

          # Import certificate to keychain
          security import $CERTIFICATE_PATH -P "$P12_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
          security list-keychain -d user -s $KEYCHAIN_PATH

          # Apply provisioning profile
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          cp $PP_PATH ~/Library/MobileDevice/Provisioning\ Profiles

      - name: Get dependencies
        run: flutter pub get

      - name: Build IPA
        run: |
          flutter build ipa --release \
            --obfuscate \
            --split-debug-info=build/symbols \
            --export-options-plist=ios/ExportOptions.plist

      - name: Upload to App Store Connect
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          xcrun altool --upload-app \
            --type ios \
            --file build/ios/ipa/*.ipa \
            --apiKey ${{ secrets.APP_STORE_API_KEY_ID }} \
            --apiIssuer ${{ secrets.APP_STORE_API_ISSUER }}
```

### 2. Codemagic Configuration

Create `codemagic.yaml`:

```yaml
workflows:
  android-workflow:
    name: Android Workflow
    instance_type: mac_mini_m1
    max_build_duration: 60

    environment:
      flutter: stable
      java: 17
      groups:
        - android_credentials
      vars:
        PACKAGE_NAME: "com.example.app"

    triggering:
      events:
        - push
        - pull_request
      branch_patterns:
        - pattern: 'main'
          include: true
        - pattern: 'develop'
          include: true

    scripts:
      - name: Get dependencies
        script: flutter pub get

      - name: Run tests
        script: flutter test

      - name: Build APK
        script: |
          flutter build apk --release \
            --build-number=$PROJECT_BUILD_NUMBER

      - name: Build AAB
        script: |
          flutter build appbundle --release \
            --build-number=$PROJECT_BUILD_NUMBER

    artifacts:
      - build/app/outputs/flutter-apk/*.apk
      - build/app/outputs/bundle/**/*.aab

    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal
        submit_as_draft: true

  ios-workflow:
    name: iOS Workflow
    instance_type: mac_mini_m1
    max_build_duration: 90
    integrations:
      app_store_connect: codemagic

    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
      groups:
        - ios_credentials
        - app_store_credentials
      vars:
        BUNDLE_ID: "com.example.app"
        APP_STORE_APP_ID: "1234567890"

    triggering:
      events:
        - push
      branch_patterns:
        - pattern: 'main'
          include: true

    scripts:
      - name: Get dependencies
        script: flutter pub get

      - name: Install pods
        script: |
          cd ios && pod install

      - name: Set up code signing
        script: |
          keychain initialize
          app-store-connect fetch-signing-files "$BUNDLE_ID" \
            --type IOS_APP_STORE \
            --create
          keychain add-certificates
          xcode-project use-profiles

      - name: Build IPA
        script: |
          flutter build ipa --release \
            --build-number=$PROJECT_BUILD_NUMBER \
            --export-options-plist=/Users/builder/export_options.plist

    artifacts:
      - build/ios/ipa/*.ipa

    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true
        beta_groups:
          - Internal Testers
```

### 3. Fastlane Setup

**Initialize Fastlane**:
```bash
# For iOS
cd ios
fastlane init

# For Android
cd android
fastlane init
```

**iOS Fastfile** (`ios/fastlane/Fastfile`):
```ruby
default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    setup_ci if ENV['CI']

    # Match for code signing
    match(
      type: "appstore",
      readonly: is_ci,
      app_identifier: "com.example.app"
    )

    # Increment build number
    increment_build_number(
      build_number: ENV['BUILD_NUMBER'] || Time.now.strftime("%Y%m%d%H%M")
    )

    # Build
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "../build/ios/ipa"
    )

    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end

  desc "Push a new release build to App Store"
  lane :release do
    setup_ci if ENV['CI']

    match(
      type: "appstore",
      readonly: is_ci
    )

    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )

    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "app-store"
    )

    upload_to_app_store(
      submit_for_review: false,
      automatic_release: false,
      precheck_include_in_app_purchases: false
    )
  end
end
```

**Android Fastfile** (`android/fastlane/Fastfile`):
```ruby
default_platform(:android)

platform :android do
  desc "Deploy a new beta version to Play Store internal track"
  lane :beta do
    # Build the app bundle
    sh "cd ../.. && flutter build appbundle --release"

    # Upload to Play Store
    upload_to_play_store(
      track: 'internal',
      aab: '../build/app/outputs/bundle/release/app-release.aab',
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Deploy a new version to Play Store production"
  lane :release do
    sh "cd ../.. && flutter build appbundle --release --obfuscate --split-debug-info=build/symbols"

    upload_to_play_store(
      track: 'production',
      aab: '../build/app/outputs/bundle/release/app-release.aab',
      mapping: '../build/app/outputs/mapping/release/mapping.txt'
    )
  end
end
```

**Appfile** (`ios/fastlane/Appfile`):
```ruby
app_identifier("com.example.app")
apple_id("developer@example.com")
itc_team_id("123456789")
team_id("ABCD1234EF")
```

**Matchfile** (`ios/fastlane/Matchfile`):
```ruby
git_url("https://github.com/org/certificates")
storage_mode("git")
type("appstore")
app_identifier(["com.example.app"])
username("developer@example.com")
```

### 4. Environment Secrets Management

**GitHub Secrets** (Settings > Secrets and variables > Actions):
```
# Android
ANDROID_KEYSTORE_BASE64     # base64-encoded keystore file
ANDROID_KEY_ALIAS           # Key alias
ANDROID_KEY_PASSWORD        # Key password
ANDROID_STORE_PASSWORD      # Store password
PLAY_STORE_SERVICE_ACCOUNT  # Google Cloud service account JSON

# iOS
IOS_BUILD_CERTIFICATE_BASE64    # base64-encoded .p12 certificate
IOS_P12_PASSWORD                # Certificate password
IOS_PROVISION_PROFILE_BASE64    # base64-encoded provisioning profile
APP_STORE_CONNECT_API_KEY       # App Store Connect API key
APP_STORE_API_KEY_ID            # API key ID
APP_STORE_API_ISSUER            # API issuer ID
KEYCHAIN_PASSWORD               # Temporary keychain password

# General
FIREBASE_TOKEN              # Firebase CLI token
CODECOV_TOKEN              # Code coverage token
```

**Encode secrets**:
```bash
# Encode keystore
base64 -i keystore.jks -o keystore_base64.txt

# Encode certificate
base64 -i certificate.p12 -o certificate_base64.txt

# Encode provisioning profile
base64 -i profile.mobileprovision -o profile_base64.txt
```

### 5. Build Caching

**Flutter dependency caching**:
```yaml
- name: Cache Flutter dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.pub-cache
      .dart_tool
    key: flutter-${{ runner.os }}-${{ hashFiles('**/pubspec.lock') }}
    restore-keys: |
      flutter-${{ runner.os }}-
```

**Gradle caching**:
```yaml
- name: Cache Gradle
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: gradle-${{ runner.os }}-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

**CocoaPods caching**:
```yaml
- name: Cache CocoaPods
  uses: actions/cache@v4
  with:
    path: ios/Pods
    key: pods-${{ runner.os }}-${{ hashFiles('**/Podfile.lock') }}
```

### 6. Integration Testing in CI

```yaml
integration-test:
  name: Integration Tests
  runs-on: macos-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}

    - name: Start iOS Simulator
      run: |
        DEVICE_ID=$(xcrun simctl list devices available | grep "iPhone 15" | head -1 | grep -oE '[A-F0-9-]{36}')
        xcrun simctl boot $DEVICE_ID

    - name: Run integration tests
      run: |
        flutter test integration_test/ \
          --device-id=$(xcrun simctl list devices booted | grep -oE '[A-F0-9-]{36}' | head -1)
```

### 7. Output Summary

```
CI/CD Configuration Complete
============================

Platform: GitHub Actions
Targets: Android, iOS, Web

Created Files:
- .github/workflows/ci.yml
- .github/workflows/release.yml

Required Secrets:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD
- ANDROID_STORE_PASSWORD
- PLAY_STORE_SERVICE_ACCOUNT
- IOS_BUILD_CERTIFICATE_BASE64
- IOS_P12_PASSWORD
- IOS_PROVISION_PROFILE_BASE64
- APP_STORE_CONNECT_API_KEY

Triggers:
- CI: Push to main/develop, Pull requests
- Release: Tags matching v*

Next Steps:
1. Add secrets to GitHub repository settings
2. Configure Play Store service account
3. Set up App Store Connect API key
4. Test workflow with a push to develop
```

## Agent Reference

For platform-specific build configurations, consult the `flutter-android-platform` and `flutter-ios-platform` agents. For testing strategies in CI, consult the `flutter-test-engineer` agent.
