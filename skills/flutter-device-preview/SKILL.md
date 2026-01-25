# /flutter-device-preview

Set up device_preview for testing across multiple device sizes and configurations.

## Usage

```
/flutter-device-preview <command> [options]
```

## Commands

- `init`: Initialize device_preview setup
- `screenshots`: Configure screenshot generation
- `golden`: Set up golden test integration
- `accessibility`: Configure accessibility testing

## Options

- `--devices <list>`: Devices to include (comma-separated)
- `--locales <list>`: Locales to test (comma-separated)
- `--themes`: Enable theme switching
- `--plugins`: Add additional plugins

## Examples

```
/flutter-device-preview init
/flutter-device-preview screenshots --devices iphone14,pixel7
/flutter-device-preview golden
/flutter-device-preview accessibility --plugins
```

## Instructions

When the user invokes `/flutter-device-preview`, follow these steps:

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  device_preview: ^1.2.0

dev_dependencies:
  golden_toolkit: ^0.15.0
```

```bash
flutter pub get
```

### 2. Basic Setup

**lib/main.dart**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    DevicePreview(
      // Only enable in debug mode
      enabled: !kReleaseMode,
      // Optional: Start with specific device
      defaultDevice: Devices.ios.iPhone13,
      builder: (context) => const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // These are required for device_preview
      useInheritedMediaQuery: true,
      locale: DevicePreview.locale(context),
      builder: DevicePreview.appBuilder,
      title: 'My App',
      home: const HomeScreen(),
    );
  }
}
```

### 3. Conditional Setup (Production Safe)

**lib/main_development.dart**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';

import 'app.dart';

void main() {
  runApp(
    DevicePreview(
      enabled: true,
      tools: const [
        ...DevicePreview.defaultTools,
      ],
      builder: (context) => const MyApp(),
    ),
  );
}
```

**lib/main_production.dart**:
```dart
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}
```

**lib/app.dart**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      useInheritedMediaQuery: true,
      locale: DevicePreview.locale(context),
      builder: DevicePreview.appBuilder,
      theme: ThemeData.light(),
      darkTheme: ThemeData.dark(),
      home: const HomeScreen(),
    );
  }
}
```

### 4. Custom Device Configuration

**lib/config/device_preview_config.dart**:
```dart
import 'package:device_preview/device_preview.dart';

class DevicePreviewConfig {
  static const List<DeviceInfo> customDevices = [
    // Custom foldable device
    DeviceInfo.genericPhone(
      id: 'custom-foldable',
      name: 'Custom Foldable',
      screenSize: Size(884, 2208),
      pixelRatio: 2.75,
      safeAreas: EdgeInsets.only(top: 24, bottom: 0),
      rotatedSafeAreas: EdgeInsets.only(top: 24, left: 0, right: 0),
    ),
    // Custom tablet
    DeviceInfo.genericTablet(
      id: 'custom-tablet',
      name: 'Custom Tablet 12"',
      screenSize: Size(2048, 2732),
      pixelRatio: 2.0,
    ),
  ];

  static List<DeviceInfo> get allDevices => [
        // iOS Devices
        Devices.ios.iPhone13,
        Devices.ios.iPhone13ProMax,
        Devices.ios.iPhoneSE,
        Devices.ios.iPadPro11Inches,
        Devices.ios.iPad,
        // Android Devices
        Devices.android.samsungGalaxyS20,
        Devices.android.samsungGalaxyNote20,
        Devices.android.smallPhone,
        Devices.android.mediumPhone,
        Devices.android.largeTablet,
        // Custom devices
        ...customDevices,
      ];

  static List<Locale> get supportedLocales => const [
        Locale('en', 'US'),
        Locale('es', 'ES'),
        Locale('fr', 'FR'),
        Locale('de', 'DE'),
        Locale('ja', 'JP'),
        Locale('ko', 'KR'),
        Locale('zh', 'CN'),
        Locale('ar', 'SA'),
      ];
}
```

**Usage**:
```dart
DevicePreview(
  enabled: true,
  devices: DevicePreviewConfig.allDevices,
  builder: (context) => const MyApp(),
)
```

### 5. Accessibility Testing

**lib/config/accessibility_config.dart**:
```dart
import 'package:device_preview/device_preview.dart';

class AccessibilityConfig {
  static const List<double> textScaleFactors = [
    0.85,  // Small
    1.0,   // Normal
    1.15,  // Large
    1.3,   // Larger
    2.0,   // Largest (accessibility mode)
  ];

  static Widget withAccessibilitySettings({
    required Widget child,
    double textScaleFactor = 1.0,
    bool boldText = false,
    bool highContrast = false,
  }) {
    return MediaQuery(
      data: MediaQuery.of(child as BuildContext).copyWith(
        textScaler: TextScaler.linear(textScaleFactor),
        boldText: boldText,
        highContrast: highContrast,
      ),
      child: child,
    );
  }
}
```

**Testing different text scales**:
```dart
// In device_preview toolbar:
// 1. Open settings
// 2. Select "Accessibility" tab
// 3. Adjust text scale factor

// Or programmatically:
class AccessibilityTestWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final scale in AccessibilityConfig.textScaleFactors)
          MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: TextScaler.linear(scale),
            ),
            child: YourWidget(),
          ),
      ],
    );
  }
}
```

### 6. Screenshot Generation

**lib/utils/screenshot_generator.dart**:
```dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class ScreenshotGenerator {
  static Future<void> captureScreenshots({
    required Widget app,
    required List<DeviceInfo> devices,
    required List<String> routes,
    String outputDirectory = 'screenshots',
  }) async {
    final directory = Directory(outputDirectory);
    if (!await directory.exists()) {
      await directory.create(recursive: true);
    }

    for (final device in devices) {
      for (final route in routes) {
        await _captureScreenshot(
          app: app,
          device: device,
          route: route,
          outputPath: '$outputDirectory/${device.identifier}_$route.png',
        );
      }
    }
  }

  static Future<void> _captureScreenshot({
    required Widget app,
    required DeviceInfo device,
    required String route,
    required String outputPath,
  }) async {
    // Implementation using RepaintBoundary
    final key = GlobalKey();

    // This would require running in a test environment
    // See golden tests section for proper implementation
  }
}

// Screenshot configurations for App Store / Play Store
class StoreScreenshotConfig {
  // iOS App Store
  static const List<DeviceInfo> iosDevices = [
    Devices.ios.iPhone13ProMax,  // 6.5" display
    Devices.ios.iPhone13,         // 5.5" display
    Devices.ios.iPadPro12Inches,  // 12.9" display
    Devices.ios.iPadPro11Inches,  // 11" display
  ];

  // Google Play Store
  static const List<DeviceInfo> androidDevices = [
    Devices.android.samsungGalaxyS20,  // Phone
    Devices.android.largeTablet,        // 7" tablet
    // 10" tablet - use custom device
  ];

  static const List<String> screenshotRoutes = [
    'home',
    'product_list',
    'product_detail',
    'cart',
    'profile',
  ];
}
```

### 7. Golden Test Integration

**test/golden/golden_test_config.dart**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';
import 'package:golden_toolkit/golden_toolkit.dart';

class GoldenTestConfig {
  static final List<Device> devices = [
    Device.phone.copyWith(name: 'iPhone SE', size: const Size(375, 667)),
    Device.phone.copyWith(name: 'iPhone 14', size: const Size(390, 844)),
    Device.phone.copyWith(name: 'iPhone 14 Pro Max', size: const Size(430, 932)),
    Device.phone.copyWith(name: 'Pixel 5', size: const Size(393, 851)),
    Device.tabletPortrait.copyWith(name: 'iPad', size: const Size(768, 1024)),
    Device.tabletLandscape.copyWith(name: 'iPad Landscape', size: const Size(1024, 768)),
  ];

  static final List<double> textScales = [1.0, 1.3, 2.0];
}
```

**test/golden/home_screen_golden_test.dart**:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';

import 'package:your_app/features/home/presentation/pages/home_screen.dart';
import 'golden_test_config.dart';

void main() {
  group('HomeScreen Golden Tests', () {
    testGoldens('HomeScreen - multiple devices', (tester) async {
      final builder = DeviceBuilder()
        ..overrideDevicesForAllScenarios(devices: GoldenTestConfig.devices)
        ..addScenario(
          name: 'default',
          widget: const HomeScreen(),
        )
        ..addScenario(
          name: 'loading',
          widget: const HomeScreen(isLoading: true),
        )
        ..addScenario(
          name: 'error',
          widget: const HomeScreen(hasError: true),
        );

      await tester.pumpDeviceBuilder(builder);
      await screenMatchesGolden(tester, 'home_screen_devices');
    });

    testGoldens('HomeScreen - text scales', (tester) async {
      for (final scale in GoldenTestConfig.textScales) {
        await tester.pumpWidgetBuilder(
          const HomeScreen(),
          surfaceSize: const Size(390, 844),
          wrapper: (child) => MaterialApp(
            builder: (context, child) => MediaQuery(
              data: MediaQuery.of(context).copyWith(
                textScaler: TextScaler.linear(scale),
              ),
              child: child!,
            ),
            home: child,
          ),
        );
        await screenMatchesGolden(tester, 'home_screen_scale_$scale');
      }
    });

    testGoldens('HomeScreen - themes', (tester) async {
      final builder = DeviceBuilder()
        ..overrideDevicesForAllScenarios(devices: [
          Device.phone.copyWith(name: 'phone'),
        ])
        ..addScenario(
          name: 'light',
          widget: Theme(
            data: ThemeData.light(),
            child: const HomeScreen(),
          ),
        )
        ..addScenario(
          name: 'dark',
          widget: Theme(
            data: ThemeData.dark(),
            child: const HomeScreen(),
          ),
        );

      await tester.pumpDeviceBuilder(builder);
      await screenMatchesGolden(tester, 'home_screen_themes');
    });
  });
}
```

Run golden tests:
```bash
# Generate golden files
flutter test --update-goldens

# Run tests
flutter test test/golden/
```

### 8. Form Factor Testing

**lib/widgets/responsive_layout.dart**:
```dart
import 'package:flutter/material.dart';

enum FormFactor { phone, tablet, desktop }

class ResponsiveLayout extends StatelessWidget {
  final Widget phone;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    super.key,
    required this.phone,
    this.tablet,
    this.desktop,
  });

  static FormFactor getFormFactor(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width >= 1200) return FormFactor.desktop;
    if (width >= 600) return FormFactor.tablet;
    return FormFactor.phone;
  }

  @override
  Widget build(BuildContext context) {
    final formFactor = getFormFactor(context);

    switch (formFactor) {
      case FormFactor.desktop:
        return desktop ?? tablet ?? phone;
      case FormFactor.tablet:
        return tablet ?? phone;
      case FormFactor.phone:
        return phone;
    }
  }
}

// Usage with device_preview
class ProductListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ResponsiveLayout(
      phone: ProductListPhone(),
      tablet: ProductListTablet(),
      desktop: ProductListDesktop(),
    );
  }
}
```

### 9. Locale Preview

**lib/main.dart**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

void main() {
  runApp(
    DevicePreview(
      enabled: true,
      builder: (context) => const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      useInheritedMediaQuery: true,
      // Use locale from device preview
      locale: DevicePreview.locale(context),
      builder: DevicePreview.appBuilder,
      // Localization setup
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('es'),
        Locale('fr'),
        Locale('de'),
        Locale('ja'),
        Locale('ar'),
      ],
      home: const HomeScreen(),
    );
  }
}
```

### 10. Plugin Extensions

**Custom Storage Plugin**:
```dart
import 'package:device_preview/device_preview.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesDevicePreviewStorage extends DevicePreviewStorage {
  SharedPreferencesDevicePreviewStorage._();

  static final instance = SharedPreferencesDevicePreviewStorage._();

  late SharedPreferences _prefs;

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  @override
  Future<String?> load() async {
    return _prefs.getString('device_preview_data');
  }

  @override
  Future<void> save(String data) async {
    await _prefs.setString('device_preview_data', data);
  }
}

// Usage
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SharedPreferencesDevicePreviewStorage.instance.initialize();

  runApp(
    DevicePreview(
      enabled: true,
      storage: SharedPreferencesDevicePreviewStorage.instance,
      builder: (context) => const MyApp(),
    ),
  );
}
```

### 11. CI Screenshot Comparison

**test/screenshot_test.dart**:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Screenshot comparison', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: HomeScreen()));

    await expectLater(
      find.byType(HomeScreen),
      matchesGoldenFile('screenshots/home_screen.png'),
    );
  });
}
```

**GitHub Actions workflow**:
```yaml
name: Golden Tests

on:
  pull_request:
    paths:
      - 'lib/**'
      - 'test/**'

jobs:
  golden-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Run golden tests
        run: flutter test test/golden/

      - name: Upload golden failures
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: golden-failures
          path: test/golden/failures/
```

### 12. Output Summary

```
Device Preview Setup Complete
=============================

Dependencies Added:
- device_preview: ^1.2.0
- golden_toolkit: ^0.15.0

Files Created:
- lib/main.dart (updated with DevicePreview)
- lib/config/device_preview_config.dart
- lib/config/accessibility_config.dart
- test/golden/golden_test_config.dart
- test/golden/home_screen_golden_test.dart

Features Enabled:
- Device frame simulation
- Multiple screen sizes
- Orientation switching
- Locale preview
- Accessibility testing (text scale)
- Theme switching
- Screenshot capture

Default Devices:
- iPhone 13 Pro Max
- iPhone SE
- Samsung Galaxy S20
- iPad Pro 11"
- Custom foldable

Testing Commands:
- Run app: flutter run -t lib/main_development.dart
- Golden tests: flutter test test/golden/
- Update goldens: flutter test --update-goldens

Next Steps:
1. Test app on different device sizes
2. Verify responsive layouts
3. Test with large text scales
4. Create golden test baselines
5. Set up CI screenshot comparison
```

## Agent Reference

For UI testing strategies, consult the `flutter-test-engineer` agent. For responsive widget design, consult the `flutter-widget-builder` agent.
