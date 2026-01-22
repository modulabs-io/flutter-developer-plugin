# /flutter-android-signing

Configure Android code signing with keystores for release builds and Play Store deployment.

## Usage

```
/flutter-android-signing [command] [options]
```

## Commands

- `create`: Create a new keystore
- `configure`: Set up signing configuration
- `verify`: Verify keystore and signing config
- `export`: Export certificate for Play App Signing
- `ci`: Set up CI/CD signing

## Options

- `--alias <name>`: Key alias name
- `--validity <days>`: Certificate validity (default: 10000)
- `--keystore <path>`: Keystore file path

## Examples

```
/flutter-android-signing create
/flutter-android-signing configure
/flutter-android-signing verify
/flutter-android-signing export
```

## Instructions

When the user invokes `/flutter-android-signing`, follow these steps:

### 1. Create Keystore

```bash
# Create upload keystore
keytool -genkey -v \
  -keystore upload-keystore.jks \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload

# You'll be prompted for:
# - Keystore password
# - Key password
# - Name, Organization, Location, etc.
```

Alternatively, for scripted creation:

```bash
keytool -genkeypair -v \
  -keystore upload-keystore.jks \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Your Name, OU=Your Unit, O=Your Organization, L=City, ST=State, C=US"
```

### 2. Create key.properties

```properties
# android/key.properties (DO NOT commit to git!)
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=upload
storeFile=../upload-keystore.jks
```

Add to `.gitignore`:

```gitignore
# android/.gitignore or root .gitignore
**/android/key.properties
**/android/*.keystore
**/android/*.jks
*.keystore
*.jks
```

### 3. Configure Gradle Signing

```groovy
// android/app/build.gradle

// Load keystore properties
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    signingConfigs {
        debug {
            // Uses default debug keystore at ~/.android/debug.keystore
        }
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Verify Keystore

```bash
# List keystore contents
keytool -list -v -keystore upload-keystore.jks

# Check alias
keytool -list -keystore upload-keystore.jks -alias upload

# Verify key details
keytool -list -v -keystore upload-keystore.jks -alias upload

# Check certificate fingerprints (SHA-1, SHA-256)
keytool -list -v -keystore upload-keystore.jks | grep SHA
```

### 5. Export Certificate for Play App Signing

```bash
# Export upload certificate
keytool -export -rfc \
  -keystore upload-keystore.jks \
  -alias upload \
  -file upload_certificate.pem

# View certificate
openssl x509 -in upload_certificate.pem -text -noout
```

### 6. Set Up Play App Signing

Play App Signing is required for new apps (since August 2021):

1. Go to Play Console → Release → Setup → App signing
2. Choose "Use Google-managed key" (recommended) or upload your own
3. Upload your **upload key certificate** (upload_certificate.pem)
4. Google will sign your app with the app signing key
5. You sign releases with the upload key

Benefits:
- Google securely stores your signing key
- Smaller APK/AAB sizes with optimized signing
- Recover from lost upload key

### 7. Build Signed Release

```bash
# Build signed APK
flutter build apk --release

# Build signed App Bundle (recommended)
flutter build appbundle --release

# With specific version
flutter build appbundle --release --build-number=10 --build-name=1.0.0

# Output locations:
# APK: build/app/outputs/flutter-apk/app-release.apk
# AAB: build/app/outputs/bundle/release/app-release.aab
```

### 8. Verify Signed APK/AAB

```bash
# Verify APK signature
apksigner verify --verbose build/app/outputs/flutter-apk/app-release.apk

# List APK certificate
apksigner verify --print-certs build/app/outputs/flutter-apk/app-release.apk

# Verify AAB
bundletool validate --bundle=build/app/outputs/bundle/release/app-release.aab

# Extract certificate from signed APK
unzip -p app-release.apk META-INF/CERT.RSA | keytool -printcert
```

### 9. CI/CD Signing Setup

#### Store Secrets

```bash
# Encode keystore to base64
base64 -i upload-keystore.jks -o keystore_base64.txt

# Store as CI/CD secret:
# - KEYSTORE_BASE64: content of keystore_base64.txt
# - STORE_PASSWORD: your store password
# - KEY_PASSWORD: your key password
# - KEY_ALIAS: upload (or your alias)
```

#### GitHub Actions Example

```yaml
# .github/workflows/android.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Decode Keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > android/app/upload-keystore.jks

      - name: Create key.properties
        run: |
          cat > android/key.properties << EOF
          storePassword=${{ secrets.STORE_PASSWORD }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          storeFile=upload-keystore.jks
          EOF

      - name: Build Release APK
        run: flutter build apk --release

      - name: Build App Bundle
        run: flutter build appbundle --release
```

### 10. Multiple Signing Configs (Flavors)

```groovy
// android/app/build.gradle
android {
    signingConfigs {
        debug {
            // default
        }
        dev {
            storeFile file("dev-keystore.jks")
            storePassword "dev_password"
            keyAlias "dev"
            keyPassword "dev_password"
        }
        staging {
            storeFile file("staging-keystore.jks")
            storePassword System.getenv("STAGING_STORE_PASSWORD")
            keyAlias "staging"
            keyPassword System.getenv("STAGING_KEY_PASSWORD")
        }
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    productFlavors {
        dev {
            signingConfig signingConfigs.dev
        }
        staging {
            signingConfig signingConfigs.staging
        }
        prod {
            signingConfig signingConfigs.release
        }
    }
}
```

### 11. Troubleshooting

```bash
# Wrong password error
# Re-enter correct password or create new keystore

# Key not found
keytool -list -keystore upload-keystore.jks
# Verify alias name matches key.properties

# Signature verification failed
# Ensure consistent signing across builds
apksigner verify --verbose app-release.apk

# Cannot recover lost keystore
# If using Play App Signing:
# 1. Go to Play Console → App signing
# 2. Request upload key reset
# 3. Generate new upload key
# 4. Upload new certificate

# Debug keystore location
# ~/.android/debug.keystore (password: android, alias: androiddebugkey)

# Check Java keytool version
keytool -h
```

### 12. Security Best Practices

```yaml
security_checklist:
  keystore:
    - [ ] Use strong passwords (12+ chars, mixed)
    - [ ] Never commit keystore to git
    - [ ] Never commit key.properties to git
    - [ ] Back up keystore securely (encrypted)
    - [ ] Document keystore credentials securely

  play_app_signing:
    - [ ] Opt in to Google Play App Signing
    - [ ] Keep upload key separate from app signing key
    - [ ] Upload certificate (not private key) to Play Console

  ci_cd:
    - [ ] Store secrets in secure vault
    - [ ] Use environment variables for passwords
    - [ ] Rotate secrets periodically
    - [ ] Limit access to signing credentials
```

### 13. Output Summary

```
Android Signing Configuration Complete
======================================

Keystore: upload-keystore.jks
Alias: upload
Validity: 10000 days
Algorithm: RSA 2048

Fingerprints:
SHA-1: AB:CD:EF:12:34:...
SHA-256: 12:34:AB:CD:EF:...

Files Created:
- android/key.properties
- android/app/upload-keystore.jks (or your path)

Gradle Configuration:
- signingConfigs.release: Configured
- buildTypes.release: Uses release signing

Git Ignore:
- key.properties: ✓ Ignored
- *.jks: ✓ Ignored

Play App Signing:
- Upload certificate: upload_certificate.pem
- Upload to Play Console for verification

Next Steps:
1. Securely backup upload-keystore.jks
2. Document credentials in secure location
3. Set up Play App Signing in Play Console
4. Build release: flutter build appbundle --release
```

## Agent Reference

For Android platform details, consult the `flutter-android-platform` agent.
