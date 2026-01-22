# /flutter-android-gradle

Configure Gradle build settings for Android Flutter projects.

## Usage

```
/flutter-android-gradle [command] [options]
```

## Commands

- `sync`: Sync Gradle project
- `clean`: Clean build cache
- `upgrade`: Upgrade Gradle/AGP versions
- `flavors`: Set up build flavors
- `variants`: List build variants
- `dependencies`: Manage dependencies

## Options

- `--agp <version>`: Android Gradle Plugin version
- `--gradle <version>`: Gradle version
- `--kotlin <version>`: Kotlin version

## Examples

```
/flutter-android-gradle sync
/flutter-android-gradle clean
/flutter-android-gradle upgrade --agp 8.2.2
/flutter-android-gradle flavors
```

## Instructions

When the user invokes `/flutter-android-gradle`, follow these steps:

### 1. Check Current Configuration

```bash
# Check Gradle version
cd android && ./gradlew --version

# Check build settings
./gradlew :app:dependencies

# List tasks
./gradlew tasks
```

### 2. Project-level build.gradle

```groovy
// android/build.gradle
buildscript {
    ext.kotlin_version = '1.9.22'

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

        // Firebase
        classpath 'com.google.gms:google-services:4.4.0'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'

subprojects {
    project.buildDir = "${rootProject.buildDir}/${project.name}"
}

subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
```

### 3. App-level build.gradle

```groovy
// android/app/build.gradle
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'dev.flutter.flutter-gradle-plugin'
}

// Load key properties for signing
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace 'com.example.myapp'
    compileSdk 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        // Enable Java 8+ API desugaring
        coreLibraryDesugaringEnabled true
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    defaultConfig {
        applicationId "com.example.myapp"
        minSdk 21
        targetSdk 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName

        multiDexEnabled true

        // Compile-time constants
        buildConfigField "String", "API_URL", "\"https://api.example.com\""
    }

    signingConfigs {
        debug {
            // Uses default debug keystore
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
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
            debuggable true
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    lint {
        disable 'InvalidPackage'
        checkReleaseBuilds false
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"

    // Java 8+ API desugaring
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.0.4'

    // Multidex
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

### 4. Configure Build Flavors

```groovy
// android/app/build.gradle
android {
    // ...

    flavorDimensions = ["environment"]

    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "MyApp Dev"
            buildConfigField "String", "API_URL", "\"https://dev-api.example.com\""
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "MyApp Staging"
            buildConfigField "String", "API_URL", "\"https://staging-api.example.com\""
        }
        prod {
            dimension "environment"
            resValue "string", "app_name", "MyApp"
            buildConfigField "String", "API_URL", "\"https://api.example.com\""
        }
    }
}
```

Use with Flutter:

```bash
# Build with flavor
flutter build apk --flavor dev --target lib/main_dev.dart
flutter build apk --flavor staging --target lib/main_staging.dart
flutter build apk --flavor prod --target lib/main.dart

# Run with flavor
flutter run --flavor dev --target lib/main_dev.dart
```

### 5. Gradle Wrapper Update

```bash
# Update Gradle wrapper
cd android
./gradlew wrapper --gradle-version=8.5

# Or edit manually
# android/gradle/wrapper/gradle-wrapper.properties
```

```properties
# android/gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### 6. Gradle Properties

```properties
# android/gradle.properties

# JVM arguments
org.gradle.jvmargs=-Xmx4G -XX:+HeapDumpOnOutOfMemoryError

# Enable parallel builds
org.gradle.parallel=true

# Enable caching
org.gradle.caching=true

# AndroidX
android.useAndroidX=true
android.enableJetifier=true

# Build features
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false

# Kotlin
kotlin.code.style=official
```

### 7. Sync Gradle Project

```bash
cd android

# Sync and refresh dependencies
./gradlew --refresh-dependencies

# Sync project
./gradlew build --dry-run
```

### 8. Clean Build

```bash
cd android

# Clean Gradle build
./gradlew clean

# Clean everything
flutter clean
cd android && ./gradlew clean
```

### 9. Add Dependencies

```groovy
// android/app/build.gradle
dependencies {
    // Kotlin stdlib
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"

    // AndroidX
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'

    // Firebase BoM (manages all Firebase versions)
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-crashlytics'
    implementation 'com.google.firebase:firebase-messaging'

    // Play Services
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    implementation 'com.google.android.gms:play-services-location:21.1.0'

    // Multidex
    implementation 'androidx.multidex:multidex:2.0.1'

    // Java 8+ desugaring
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.0.4'

    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

### 10. Configure Splits (APK per ABI)

```groovy
// android/app/build.gradle
android {
    // ...

    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86_64"
            universalApk true  // Also generate universal APK
        }
    }

    // Set version codes for different ABIs
    project.ext.abiCodes = ['armeabi-v7a': 1, 'arm64-v8a': 2, 'x86_64': 3]

    applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def abiFilter = output.getFilter(com.android.build.OutputFile.ABI)
            def abiCode = project.ext.abiCodes.get(abiFilter)
            if (abiCode != null) {
                output.versionCodeOverride = variant.versionCode * 10 + abiCode
            }
        }
    }
}
```

### 11. List Build Variants

```bash
cd android

# List all variants
./gradlew tasks | grep assemble

# Output example:
# assembleDebug
# assembleRelease
# assembleDevDebug
# assembleDevRelease
# assembleStagingDebug
# assembleStagingRelease
# assembleProdDebug
# assembleProdRelease
```

### 12. Troubleshooting

```bash
# Clear Gradle caches
rm -rf ~/.gradle/caches/
cd android && ./gradlew clean

# Fix daemon issues
./gradlew --stop

# Run with debug info
./gradlew build --info
./gradlew build --debug
./gradlew build --stacktrace

# Check dependency conflicts
./gradlew :app:dependencies

# Resolve SDK license issues
flutter doctor --android-licenses

# Memory issues - increase heap
# Edit android/gradle.properties:
# org.gradle.jvmargs=-Xmx4G
```

### 13. Output Summary

```
Gradle Configuration Complete
=============================

Gradle Version: 8.5
AGP Version: 8.2.2
Kotlin Version: 1.9.22

Build Variants:
- devDebug
- devRelease
- stagingDebug
- stagingRelease
- prodDebug
- prodRelease

Dependencies Updated:
+ firebase-bom:32.7.0
+ play-services-auth:20.7.0

Build Configuration:
- minSdk: 21
- targetSdk: 34
- compileSdk: 34
- Multidex: enabled
- R8/ProGuard: enabled (release)

Next Steps:
1. Sync project: cd android && ./gradlew build --dry-run
2. Build: flutter build apk --release
3. Test variants: flutter run --flavor prod
```

## Agent Reference

For Android platform details, consult the `flutter-android-platform` agent.
