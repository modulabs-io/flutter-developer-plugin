# /flutter-web-platform

Configure and optimize Flutter web applications with proper rendering, PWA support, and deployment strategies.

## Usage

```
/flutter-web-platform [command] [options]
```

## Commands

- `init`: Initialize web platform configuration
- `pwa`: Configure Progressive Web App features
- `deploy`: Deploy to hosting platform
- `optimize`: Apply web-specific optimizations

## Options

- `--renderer <type>`: Web renderer (canvaskit, html, auto)
- `--pwa`: Enable PWA configuration
- `--hosting <platform>`: Deploy target (firebase, vercel, netlify, github-pages)
- `--base-href <path>`: Base URL path for deployment

## Examples

```
/flutter-web-platform init --renderer canvaskit
/flutter-web-platform pwa
/flutter-web-platform deploy --hosting firebase
/flutter-web-platform optimize
```

## Instructions

When the user invokes `/flutter-web-platform`, follow these steps:

### 1. Verify Web Platform Setup

```bash
# Check Flutter web support
flutter config --enable-web

# Verify web platform is available
flutter devices | grep -i chrome
```

### 2. Web Renderer Selection

Flutter web supports multiple renderers:

**CanvasKit** (Recommended for most apps):
```bash
# Build with CanvasKit
flutter build web --web-renderer canvaskit

# Run with CanvasKit
flutter run -d chrome --web-renderer canvaskit
```
- Best visual fidelity and consistency
- Larger initial download (~2MB for CanvasKit)
- Better performance for complex graphics
- Supports all Flutter features

**HTML Renderer**:
```bash
# Build with HTML renderer
flutter build web --web-renderer html

# Run with HTML renderer
flutter run -d chrome --web-renderer html
```
- Smaller initial download
- Better text selection/accessibility
- Limited gradient and effect support
- Good for text-heavy apps

**Auto Selection**:
```bash
# Auto-select based on device
flutter build web --web-renderer auto
```
- Mobile: HTML renderer
- Desktop: CanvasKit renderer

### 3. PWA Configuration

**manifest.json** (`web/manifest.json`):
```json
{
  "name": "My Flutter App",
  "short_name": "FlutterApp",
  "description": "A Flutter web application",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0175C2",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "icons/Icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/Icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Service Worker** (`web/flutter_service_worker.js`):
Flutter auto-generates service worker. Customize caching in `index.html`:

```html
<script>
  var serviceWorkerVersion = null;
  var scriptLoaded = false;
  function loadMainDartJs() {
    if (scriptLoaded) return;
    scriptLoaded = true;
    var scriptTag = document.createElement('script');
    scriptTag.src = 'main.dart.js';
    scriptTag.type = 'application/javascript';
    document.body.append(scriptTag);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('flutter_service_worker.js');
    });
  }
</script>
```

**Offline Support** - Add to `pubspec.yaml`:
```yaml
dependencies:
  pwa_install: ^0.0.3  # PWA install prompt
```

### 4. Web Index Configuration

**index.html** (`web/index.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <meta name="description" content="Your app description">
  <meta name="keywords" content="flutter, web, app">
  <meta name="author" content="Your Name">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="My Flutter App">
  <meta property="og:description" content="Your app description">
  <meta property="og:image" content="https://example.com/og-image.png">
  <meta property="og:url" content="https://example.com">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="My Flutter App">
  <meta name="twitter:description" content="Your app description">
  <meta name="twitter:image" content="https://example.com/twitter-image.png">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">

  <!-- PWA Manifest -->
  <link rel="manifest" href="manifest.json">

  <!-- Theme Color -->
  <meta name="theme-color" content="#0175C2">

  <title>My Flutter App</title>

  <!-- Preload critical resources -->
  <link rel="preload" href="main.dart.js" as="script">

  <style>
    /* Loading indicator styles */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <div id="loading" class="loading">
    <img src="splash/img/light-1x.png" alt="Loading...">
  </div>

  <script src="flutter_bootstrap.js" async></script>
</body>
</html>
```

### 5. CORS Configuration

For API calls, configure CORS on your backend. For development:

```bash
# Run with CORS disabled (development only!)
flutter run -d chrome --web-browser-flag "--disable-web-security"
```

**Proxy Configuration** (for development):
Create `web/proxy.conf.json`:
```json
{
  "/api": {
    "target": "https://api.example.com",
    "secure": true,
    "changeOrigin": true
  }
}
```

### 6. Web-Specific Optimizations

**Tree Shaking Icons**:
```yaml
# pubspec.yaml
flutter:
  fonts:
    - family: MaterialIcons
      fonts:
        - asset: fonts/MaterialIcons-Regular.otf
```

Or use specific icons only:
```dart
// Only import icons you use
import 'package:flutter/material.dart' show Icons;
```

**Deferred Loading**:
```dart
import 'package:flutter/material.dart';
import 'heavy_feature.dart' deferred as heavy;

class MyApp extends StatelessWidget {
  Future<void> loadHeavyFeature() async {
    await heavy.loadLibrary();
    // Now use heavy.HeavyWidget()
  }
}
```

**Image Optimization**:
```dart
Image.network(
  'https://example.com/image.jpg',
  loadingBuilder: (context, child, loadingProgress) {
    if (loadingProgress == null) return child;
    return CircularProgressIndicator(
      value: loadingProgress.expectedTotalBytes != null
          ? loadingProgress.cumulativeBytesLoaded /
              loadingProgress.expectedTotalBytes!
          : null,
    );
  },
  cacheWidth: 800,  // Resize for web
  cacheHeight: 600,
)
```

### 7. Deployment

#### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
flutter build web --release --web-renderer canvaskit
firebase deploy --only hosting
```

**firebase.json**:
```json
{
  "hosting": {
    "public": "build/web",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Vercel

Create `vercel.json`:
```json
{
  "buildCommand": "flutter build web --release",
  "outputDirectory": "build/web",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

```bash
# Deploy
vercel --prod
```

#### Netlify

Create `netlify.toml`:
```toml
[build]
  publish = "build/web"
  command = "flutter build web --release"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### GitHub Pages

```bash
# Build with correct base href
flutter build web --release --base-href /repository-name/

# Deploy to gh-pages branch
cd build/web
git init
git add .
git commit -m "Deploy to GitHub Pages"
git push -f https://github.com/user/repo.git main:gh-pages
```

### 8. Web-Specific Debugging

```dart
import 'package:flutter/foundation.dart' show kIsWeb;

if (kIsWeb) {
  // Web-specific code
  print('Running on web');
}

// Check renderer
import 'dart:html' as html;
bool get isCanvasKit =>
    html.document.querySelector('flt-glass-pane') != null;
```

**Browser DevTools**:
- Network tab: Monitor asset loading
- Performance tab: Profile rendering
- Application tab: Check service worker, storage
- Lighthouse: Audit PWA, performance, SEO

### 9. Security Headers

Configure on your hosting platform:

```
# Recommended security headers
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

### 10. WebAssembly (Wasm) Build

Flutter 3.22+ supports WebAssembly compilation:

```bash
# Build with Wasm (experimental)
flutter build web --wasm

# Output: build/web_wasm/
```

Benefits:
- Faster execution than JavaScript
- Better performance for compute-heavy apps
- Smaller runtime overhead

Limitations:
- Larger initial download
- Not all browsers support all Wasm features
- Some plugins may not be compatible

## Output Summary

```
Web Platform Configuration Complete
====================================

Renderer: CanvasKit
PWA: Enabled
Hosting: Firebase

Configuration Files:
- web/index.html (updated with SEO tags)
- web/manifest.json (PWA manifest)
- firebase.json (hosting config)

Build Command:
flutter build web --release --web-renderer canvaskit

Deploy Command:
firebase deploy --only hosting

Next Steps:
1. Test PWA installation on mobile
2. Run Lighthouse audit
3. Verify offline functionality
4. Test on multiple browsers
```

## Agent Reference

For architectural decisions about web applications, consult the `flutter-architect` agent. For web-specific performance optimization, consult the `flutter-performance-analyst` agent.
