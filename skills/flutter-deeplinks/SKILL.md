# /flutter-deeplinks

Configure deep linking and universal links for Flutter applications.

## Usage

```
/flutter-deeplinks <platform> [options]
```

## Platforms

- `android`: Android App Links configuration
- `ios`: iOS Universal Links configuration
- `all`: Configure both platforms

## Options

- `--domain <domain>`: Your app's domain (e.g., example.com)
- `--paths <paths>`: URL paths to handle (comma-separated)
- `--scheme <scheme>`: Custom URL scheme (e.g., myapp)
- `--router <type>`: Router integration (go_router, auto_route)

## Examples

```
/flutter-deeplinks all --domain example.com --router go_router
/flutter-deeplinks ios --domain example.com --paths /products,/users
/flutter-deeplinks android --scheme myapp
```

## Instructions

When the user invokes `/flutter-deeplinks`, follow these steps:

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  go_router: ^14.6.2        # Recommended router with deep link support
  app_links: ^6.3.3         # Handle incoming links
  uni_links: ^0.5.1         # Alternative for older projects
```

```bash
flutter pub get
```

### 2. Android App Links Configuration

**android/app/src/main/AndroidManifest.xml**:
```xml
<manifest>
    <application>
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask"
            android:exported="true">

            <!-- Deep link with custom scheme -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <category android:name="android.intent.category.BROWSABLE"/>
                <data android:scheme="myapp"/>
            </intent-filter>

            <!-- Android App Links (verified) -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <category android:name="android.intent.category.BROWSABLE"/>
                <data
                    android:scheme="https"
                    android:host="example.com"
                    android:pathPrefix="/app"/>
            </intent-filter>

            <!-- Multiple paths -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <category android:name="android.intent.category.BROWSABLE"/>
                <data android:scheme="https" android:host="example.com"/>
                <data android:path="/products"/>
                <data android:path="/users"/>
                <data android:pathPattern="/product/.*"/>
            </intent-filter>

        </activity>
    </application>
</manifest>
```

**Digital Asset Links** - Host at `https://example.com/.well-known/assetlinks.json`:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

Get SHA256 fingerprint:
```bash
# Debug key
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256

# Release key
keytool -list -v -keystore your-release-key.jks -alias your-alias | grep SHA256
```

### 3. iOS Universal Links Configuration

**ios/Runner/Runner.entitlements**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:example.com</string>
        <string>applinks:www.example.com</string>
    </array>
</dict>
</plist>
```

**ios/Runner/Info.plist** - Add URL schemes:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.example.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>
```

**Apple App Site Association** - Host at `https://example.com/.well-known/apple-app-site-association`:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.example.app",
        "paths": [
          "/app/*",
          "/products/*",
          "/users/*",
          "NOT /api/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAMID.com.example.app"]
  }
}
```

Server requirements:
- File must be served with `Content-Type: application/json`
- Must be accessible via HTTPS (no redirects)
- No `.json` extension in the URL

### 4. Deep Link Handler Service

**lib/services/deep_link_service.dart**:
```dart
import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';

class DeepLinkService {
  DeepLinkService._();
  static final DeepLinkService instance = DeepLinkService._();

  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _linkSubscription;

  final _deepLinkController = StreamController<Uri>.broadcast();
  Stream<Uri> get deepLinkStream => _deepLinkController.stream;

  Future<void> initialize() async {
    // Handle link when app is started from link
    final initialLink = await _appLinks.getInitialLink();
    if (initialLink != null) {
      _deepLinkController.add(initialLink);
    }

    // Handle links when app is in foreground/background
    _linkSubscription = _appLinks.uriLinkStream.listen((uri) {
      _deepLinkController.add(uri);
    });
  }

  void dispose() {
    _linkSubscription?.cancel();
    _deepLinkController.close();
  }
}
```

### 5. GoRouter Integration

**lib/router/app_router.dart**:
```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final navigatorKey = GlobalKey<NavigatorState>();

final goRouter = GoRouter(
  navigatorKey: navigatorKey,
  initialLocation: '/',
  debugLogDiagnostics: true,

  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/products',
      builder: (context, state) => const ProductListScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) {
        final productId = state.pathParameters['id']!;
        return ProductDetailScreen(productId: productId);
      },
    ),
    GoRoute(
      path: '/user/:userId',
      builder: (context, state) {
        final userId = state.pathParameters['userId']!;
        return UserProfileScreen(userId: userId);
      },
    ),
    GoRoute(
      path: '/order/:orderId',
      builder: (context, state) {
        final orderId = state.pathParameters['orderId']!;
        // Handle query parameters
        final showDetails = state.uri.queryParameters['details'] == 'true';
        return OrderScreen(orderId: orderId, showDetails: showDetails);
      },
    ),
    // Redirect route
    GoRoute(
      path: '/share/:code',
      redirect: (context, state) async {
        final code = state.pathParameters['code']!;
        // Resolve share code to actual route
        final resolvedPath = await resolveShareCode(code);
        return resolvedPath;
      },
    ),
  ],

  // Error handling
  errorBuilder: (context, state) => ErrorScreen(error: state.error),

  // Redirect logic
  redirect: (context, state) {
    // Check authentication
    final isLoggedIn = authService.isLoggedIn;
    final isLoginRoute = state.matchedLocation == '/login';

    // Redirect to login if not authenticated and accessing protected route
    if (!isLoggedIn && state.matchedLocation.startsWith('/user')) {
      return '/login?redirect=${state.matchedLocation}';
    }

    return null; // No redirect
  },
);

// Helper to resolve share codes
Future<String> resolveShareCode(String code) async {
  // Call API to resolve share code
  final result = await api.resolveShareCode(code);
  return result.path;
}
```

**lib/main.dart**:
```dart
import 'package:flutter/material.dart';
import 'router/app_router.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: goRouter,
      title: 'My App',
    );
  }
}
```

### 6. Manual Deep Link Handling (Without GoRouter)

**lib/services/deep_link_handler.dart**:
```dart
import 'package:flutter/material.dart';

class DeepLinkHandler {
  final GlobalKey<NavigatorState> navigatorKey;

  DeepLinkHandler({required this.navigatorKey});

  void handleDeepLink(Uri uri) {
    final path = uri.path;
    final queryParams = uri.queryParameters;

    // Parse path segments
    final segments = uri.pathSegments;

    if (segments.isEmpty) {
      _navigateTo('/');
      return;
    }

    switch (segments[0]) {
      case 'product':
        if (segments.length > 1) {
          final productId = segments[1];
          _navigateTo('/product', arguments: {'id': productId});
        }
        break;
      case 'user':
        if (segments.length > 1) {
          final userId = segments[1];
          _navigateTo('/user', arguments: {'id': userId});
        }
        break;
      case 'order':
        if (segments.length > 1) {
          final orderId = segments[1];
          final showDetails = queryParams['details'] == 'true';
          _navigateTo('/order', arguments: {
            'id': orderId,
            'showDetails': showDetails,
          });
        }
        break;
      default:
        _navigateTo('/');
    }
  }

  void _navigateTo(String route, {Object? arguments}) {
    navigatorKey.currentState?.pushNamedAndRemoveUntil(
      route,
      (route) => false,
      arguments: arguments,
    );
  }
}
```

### 7. Deferred Deep Links

For tracking attribution when app is installed after clicking link:

**Using Firebase Dynamic Links** (deprecated but still functional):
```dart
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';

class DeferredDeepLinkService {
  Future<void> initialize() async {
    // Check for deferred deep link on first launch
    final dynamicLink = await FirebaseDynamicLinks.instance.getInitialLink();

    if (dynamicLink != null) {
      _handleDynamicLink(dynamicLink);
    }

    // Listen for dynamic links while app is open
    FirebaseDynamicLinks.instance.onLink.listen(_handleDynamicLink);
  }

  void _handleDynamicLink(PendingDynamicLinkData data) {
    final deepLink = data.link;
    // Handle the deep link
    print('Received dynamic link: $deepLink');
  }
}
```

**Using Branch.io**:
```dart
import 'package:flutter_branch_sdk/flutter_branch_sdk.dart';

class BranchDeepLinkService {
  Future<void> initialize() async {
    await FlutterBranchSdk.init();

    FlutterBranchSdk.listSession().listen((data) {
      if (data.containsKey('+clicked_branch_link') &&
          data['+clicked_branch_link'] == true) {
        // Handle Branch deep link
        final path = data['path'];
        final params = data['params'];
        print('Branch link clicked: $path');
      }
    });
  }

  Future<String> createBranchLink({
    required String title,
    required String path,
    Map<String, dynamic>? params,
  }) async {
    final buo = BranchUniversalObject(
      canonicalIdentifier: path,
      title: title,
      contentMetadata: BranchContentMetaData()
        ..addCustomMetadata('path', path),
    );

    final linkProperties = BranchLinkProperties(
      channel: 'app',
      feature: 'sharing',
    );

    final response = await FlutterBranchSdk.getShortUrl(
      buo: buo,
      linkProperties: linkProperties,
    );

    return response.result!;
  }
}
```

### 8. Testing Deep Links

**Android**:
```bash
# Test custom scheme
adb shell am start -a android.intent.action.VIEW \
  -d "myapp://product/123" com.example.app

# Test App Links
adb shell am start -a android.intent.action.VIEW \
  -d "https://example.com/product/123" com.example.app

# Verify App Links
adb shell pm get-app-links com.example.app
```

**iOS**:
```bash
# Test URL scheme (Simulator)
xcrun simctl openurl booted "myapp://product/123"

# Test Universal Links (Simulator)
xcrun simctl openurl booted "https://example.com/product/123"
```

**Test from terminal**:
```bash
# Open URL on connected device
flutter run --route="/product/123"
```

### 9. Web-to-App Smart Banners

**iOS Smart App Banner** (add to web page):
```html
<meta name="apple-itunes-app" content="app-id=123456789, app-argument=https://example.com/product/123">
```

**Android Intent Link** (add to web page):
```html
<a href="intent://product/123#Intent;scheme=myapp;package=com.example.app;S.browser_fallback_url=https://example.com/product/123;end">
  Open in App
</a>
```

### 10. Verification Checklist

```bash
# Verify Android assetlinks.json
curl -I https://example.com/.well-known/assetlinks.json

# Verify iOS apple-app-site-association
curl -I https://example.com/.well-known/apple-app-site-association

# Test AASA validity
curl https://app-site-association.cdn-apple.com/a/v1/example.com
```

### 11. Output Summary

```
Deep Link Configuration Complete
================================

Domain: example.com
Platforms: Android, iOS

Android Configuration:
- AndroidManifest.xml updated with intent filters
- assetlinks.json template created
- SHA256 fingerprints needed

iOS Configuration:
- Runner.entitlements updated with associated domains
- Info.plist updated with URL schemes
- apple-app-site-association template created

Router: go_router
Routes Configured:
- / (Home)
- /products (Product List)
- /product/:id (Product Detail)
- /user/:userId (User Profile)
- /order/:orderId (Order Detail)

Server Files to Deploy:
- /.well-known/assetlinks.json (Android)
- /.well-known/apple-app-site-association (iOS)

Testing Commands:
- Android: adb shell am start -d "https://example.com/product/123"
- iOS: xcrun simctl openurl booted "https://example.com/product/123"

Next Steps:
1. Deploy server verification files
2. Get SHA256 fingerprints for release keystore
3. Configure Apple Developer associated domains
4. Test on physical devices
5. Verify with Google Digital Asset Links API
```

## Agent Reference

For platform-specific deep link configuration, consult the `flutter-android-platform` and `flutter-ios-platform` agents. For routing architecture, consult the `flutter-architect` agent.
