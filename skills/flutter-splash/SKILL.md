# /flutter-splash

Configure splash screens and launch screens across all platforms.

## Usage

```
/flutter-splash [command] [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `setup` | Configure flutter_native_splash package |
| `generate` | Generate splash screen assets for all platforms |
| `remove` | Remove splash screen configuration |
| `update` | Update existing splash screen configuration |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--color <hex>` | Background color | `#ffffff` |
| `--image <path>` | Splash image path | none |
| `--dark-color <hex>` | Dark mode background color | none |
| `--dark-image <path>` | Dark mode splash image | none |
| `--fullscreen` | Use fullscreen splash | `true` |
| `--android-12` | Configure Android 12+ splash | `true` |
| `--branding <path>` | Branding image (Android 12+) | none |
| `--web` | Include web platform | `false` |

## Examples

```bash
# Basic setup with color and image
/flutter-splash setup --color "#42a5f5" --image assets/splash.png

# Setup with dark mode support
/flutter-splash setup --color "#ffffff" --image assets/splash.png --dark-color "#121212" --dark-image assets/splash_dark.png

# Setup with Android 12 branding
/flutter-splash setup --color "#42a5f5" --image assets/splash.png --branding assets/branding.png

# Generate after manual config changes
/flutter-splash generate

# Remove all splash configuration
/flutter-splash remove

# Update existing configuration
/flutter-splash update --color "#1976d2"
```

## Setup Steps

When running `/flutter-splash setup`, the skill performs:

### 1. Add Dependency

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_native_splash: ^2.4.7
```

### 2. Create Configuration

```yaml
# flutter_native_splash.yaml (or in pubspec.yaml)
flutter_native_splash:
  # Light mode
  color: "#42a5f5"
  image: assets/splash.png

  # Dark mode (optional)
  color_dark: "#121212"
  image_dark: assets/splash_dark.png

  # Android 12+ configuration
  android_12:
    color: "#42a5f5"
    color_dark: "#121212"
    image: assets/splash_android12.png
    image_dark: assets/splash_android12_dark.png
    icon_background_color: "#ffffff"
    icon_background_color_dark: "#121212"
    branding: assets/branding.png
    branding_dark: assets/branding_dark.png

  # Platform flags
  android: true
  ios: true
  web: false

  # Display options
  fullscreen: true

  # Android specific
  android_gravity: center
  android_screen_orientation: portrait

  # iOS specific
  ios_content_mode: center
```

### 3. Generate Splash Screens

```bash
dart run flutter_native_splash:create
```

## flutter_native_splash Configuration

### Full Configuration Reference

```yaml
flutter_native_splash:
  # === Required ===
  color: "#ffffff"                    # Background color (hex)

  # === Images ===
  image: assets/splash.png            # Center image
  branding: assets/branding.png       # Bottom branding (Android 12+)

  # === Dark Mode ===
  color_dark: "#121212"
  image_dark: assets/splash_dark.png
  branding_dark: assets/branding_dark.png

  # === Android 12+ (SplashScreen API) ===
  android_12:
    color: "#42a5f5"
    color_dark: "#121212"
    image: assets/android12_splash.png
    image_dark: assets/android12_splash_dark.png
    icon_background_color: "#ffffff"
    icon_background_color_dark: "#121212"
    branding: assets/branding.png
    branding_dark: assets/branding_dark.png

  # === Platform Enablement ===
  android: true
  ios: true
  web: false

  # === Display Options ===
  fullscreen: true                    # Hide status/navigation bars

  # === Android Options ===
  android_gravity: center             # center, bottom, fill, etc.
  android_screen_orientation: portrait # portrait, sensorPortrait, sensorLandscape, landscape

  # === iOS Options ===
  ios_content_mode: center            # scaleToFill, scaleAspectFit, scaleAspectFill, center, etc.

  # === Web Options ===
  web_image_mode: center              # center, contain, stretch, cover
  background_image: assets/background.png
  background_image_dark: assets/background_dark.png
```

### Commands

```bash
# Generate splash screens
dart run flutter_native_splash:create

# Generate from custom config file
dart run flutter_native_splash:create --path=flutter_native_splash.yaml

# Remove splash screens
dart run flutter_native_splash:remove
```

## Programmatic Splash Control

### Preserve Splash During Initialization

```dart
import 'package:flutter_native_splash/flutter_native_splash.dart';

void main() async {
  // Preserve splash screen while initializing
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  // Perform initialization
  await initializeApp();
  await loadResources();
  await checkAuthentication();

  // Remove splash when ready
  FlutterNativeSplash.remove();

  runApp(const MyApp());
}
```

### With Riverpod

```dart
void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  final container = ProviderContainer();

  // Initialize providers
  await container.read(initializationProvider.future);

  FlutterNativeSplash.remove();

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const MyApp(),
    ),
  );
}
```

### Delayed Removal

```dart
class SplashController {
  static bool _removed = false;

  static void remove() {
    if (!_removed) {
      FlutterNativeSplash.remove();
      _removed = true;
    }
  }
}

// In your app initialization
class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    // Remove splash after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      SplashController.remove();
    });
  }
}
```

## Platform-Specific Configuration

### iOS LaunchScreen

The package modifies `ios/Runner/Base.lproj/LaunchScreen.storyboard`.

For manual customization in Xcode:
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select `LaunchScreen.storyboard`
3. Modify using Interface Builder
4. Use AutoLayout for all screen sizes

#### Info.plist Configuration

```xml
<!-- Automatically set by flutter_native_splash -->
<key>UILaunchStoryboardName</key>
<string>LaunchScreen</string>
```

### Android Configuration

#### Pre-Android 12 (styles.xml)

```xml
<!-- android/app/src/main/res/values/styles.xml -->
<style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">
    <item name="android:windowBackground">@drawable/launch_background</item>
    <item name="android:windowFullscreen">true</item>
</style>

<style name="NormalTheme" parent="@android:style/Theme.Light.NoTitleBar">
    <item name="android:windowBackground">?android:colorBackground</item>
</style>
```

#### launch_background.xml

```xml
<!-- android/app/src/main/res/drawable/launch_background.xml -->
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash" />
    </item>
</layer-list>
```

#### Android 12+ SplashScreen API

```xml
<!-- android/app/src/main/res/values-v31/styles.xml -->
<style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">
    <item name="android:windowSplashScreenBackground">@color/splash_background</item>
    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
    <item name="android:windowSplashScreenIconBackgroundColor">@color/icon_background</item>
    <item name="android:windowSplashScreenBrandingImage">@drawable/branding</item>
</style>
```

#### AndroidManifest.xml

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTop"
    android:theme="@style/LaunchTheme"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
    android:hardwareAccelerated="true"
    android:windowSoftInputMode="adjustResize">
    <meta-data
        android:name="io.flutter.embedding.android.NormalTheme"
        android:resource="@style/NormalTheme" />
</activity>
```

### macOS Configuration

For macOS, the splash is handled via a separate storyboard:
- Located at: `macos/Runner/Base.lproj/MainMenu.xib`
- Modify using Xcode Interface Builder

### Windows Configuration

Windows uses a separate splash window during initialization:
```cpp
// windows/runner/main.cpp
// The splash is shown until Flutter engine is ready
```

### Linux Configuration

Linux uses GTK for splash handling:
- Configured in `linux/my_application.cc`
- Background color set via GDK

### Web Configuration

```yaml
flutter_native_splash:
  web: true
  web_image_mode: center    # center, contain, stretch, cover
  color: "#42a5f5"
  image: assets/splash.png
```

Generates CSS and modifies `web/index.html`.

## Asset Requirements

### Recommended Image Sizes

| Platform | Image Type | Recommended Size |
|----------|-----------|------------------|
| Android | Splash | 1152x1152 px |
| Android 12 | Icon | 288x288 px (inside 432x432 safe zone) |
| iOS | Splash | 1242x2688 px (max) |
| Web | Splash | 1920x1920 px |

### Image Guidelines

1. **Use PNG format** for transparency support
2. **Center important content** to account for cropping
3. **Keep branding simple** - avoid detailed text
4. **Test on multiple screen sizes**
5. **Provide @2x, @3x versions** for iOS if using LaunchImage

### Android 12 Icon Constraints

The Android 12 adaptive icon has specific constraints:
- Icon should be 288x288 dp
- Content should fit within 192x192 dp inner circle
- Background is customizable via `icon_background_color`

```
┌─────────────────────┐
│                     │
│    ┌───────────┐    │
│    │           │    │
│    │   ICON    │    │
│    │           │    │
│    └───────────┘    │
│                     │
└─────────────────────┘
     432 x 432 dp
Inner safe zone: 288 x 288 dp
```

## Animated Splash Screens

For animated splash screens, consider:

### 1. Lottie Animation (after native splash)

```dart
class AnimatedSplash extends StatefulWidget {
  @override
  State<AnimatedSplash> createState() => _AnimatedSplashState();
}

class _AnimatedSplashState extends State<AnimatedSplash> {
  @override
  void initState() {
    super.initState();
    FlutterNativeSplash.remove(); // Remove native splash
    _navigateToHome();
  }

  Future<void> _navigateToHome() async {
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Lottie.asset('assets/splash_animation.json'),
      ),
    );
  }
}
```

### 2. Android 12 Animated Icons

Android 12+ supports animated vector drawables (AVD):
```xml
<!-- res/drawable/splash_animated.xml -->
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@drawable/splash_vector">
    <target
        android:name="path"
        android:animation="@animator/splash_animation" />
</animated-vector>
```

## Troubleshooting

### Common Issues

1. **Splash not showing on iOS**
   - Clean build: `flutter clean && flutter build ios`
   - Delete derived data in Xcode

2. **Android 12 icon cropped**
   - Ensure icon content fits within safe zone
   - Use `icon_background_color` for padding

3. **Dark mode not working**
   - Verify `color_dark` and `image_dark` are set
   - Test on device with dark mode enabled

4. **Splash shows for too long/short**
   - Use `FlutterNativeSplash.preserve()` and `.remove()` for control

5. **Web splash not centered**
   - Check `web_image_mode` setting
   - Verify image dimensions

### Reset Configuration

```bash
# Remove all splash configuration
dart run flutter_native_splash:remove

# Clean and regenerate
flutter clean
dart run flutter_native_splash:create
```

## Best Practices

1. **Match your app's first screen**: Launch screen should mirror initial UI
2. **Keep it simple**: Avoid text (localization issues) and detailed graphics
3. **Use solid colors**: Gradients may not render consistently
4. **Test on real devices**: Emulators may not show accurate timings
5. **Provide dark mode**: Users expect theme-aware splash screens
6. **Optimize image sizes**: Large images increase app size

## Apple Human Interface Guidelines

For iOS:
- Launch screen should match the first screen of your app
- Avoid including text (localization, quick loading)
- Don't use a splash screen as a "loading" screen
- Don't display logos if your app loads quickly
- Use static images only (no animation during launch)

## Related

- `flutter-architect` agent - App initialization patterns
- `flutter-ios-platform` agent - iOS-specific configuration
- `flutter-android-platform` agent - Android-specific configuration
- [flutter_native_splash package](https://pub.dev/packages/flutter_native_splash)
