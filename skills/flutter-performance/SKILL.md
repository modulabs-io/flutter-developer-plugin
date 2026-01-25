# /flutter-performance

Analyze and optimize Flutter application performance using DevTools and best practices.

## Usage

```
/flutter-performance <command> [options]
```

## Commands

- `profile`: Set up performance profiling
- `analyze`: Analyze current performance issues
- `optimize`: Apply optimization recommendations
- `audit`: Run comprehensive performance audit

## Options

- `--area <area>`: Focus area (startup, rendering, memory, network)
- `--report`: Generate performance report
- `--baseline`: Create performance baseline
- `--compare`: Compare against baseline

## Examples

```
/flutter-performance profile --area rendering
/flutter-performance analyze --report
/flutter-performance optimize --area startup
/flutter-performance audit
```

## Instructions

When the user invokes `/flutter-performance`, follow these steps:

### 1. Launch Performance Profiling

```bash
# Run in profile mode (required for accurate metrics)
flutter run --profile

# Launch DevTools
flutter pub global activate devtools
flutter pub global run devtools
```

DevTools Performance tab features:
- Frame rendering timeline
- CPU profiler
- Memory profiler
- Network profiler

### 2. Identify Jank (Dropped Frames)

**Target frame rates**:
- 60 FPS = 16.67ms per frame
- 120 FPS = 8.33ms per frame

**Enable performance overlay**:
```dart
MaterialApp(
  showPerformanceOverlay: true,  // Shows frame timing
  checkerboardRasterCacheImages: true,  // Shows cached images
  checkerboardOffscreenLayers: true,  // Shows offscreen layers
)
```

**Programmatic frame monitoring**:
```dart
import 'dart:developer' as developer;

void trackFrame() {
  WidgetsBinding.instance.addPostFrameCallback((timestamp) {
    developer.Timeline.startSync('Frame');
    // Your code
    developer.Timeline.finishSync();
  });
}
```

### 3. Widget Rebuild Optimization

**Identify unnecessary rebuilds**:
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    debugPrint('MyWidget rebuilding');  // Track rebuilds
    return Container();
  }
}
```

**Use const constructors**:
```dart
// Bad - rebuilds every time parent rebuilds
Widget build(BuildContext context) {
  return Container(
    child: Text('Hello'),
    padding: EdgeInsets.all(16),
  );
}

// Good - won't rebuild unnecessarily
Widget build(BuildContext context) {
  return const Container(
    padding: EdgeInsets.all(16),
    child: Text('Hello'),
  );
}
```

**Split widgets for selective rebuilds**:
```dart
// Bad - entire tree rebuilds when counter changes
class CounterPage extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ExpensiveHeader(),  // Rebuilds unnecessarily
        Text('Count: $counter'),
        const ExpensiveFooter(),  // Rebuilds unnecessarily
      ],
    );
  }
}

// Good - only counter widget rebuilds
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        ExpensiveHeader(),
        CounterDisplay(),  // Separate stateful widget
        ExpensiveFooter(),
      ],
    );
  }
}
```

**Use RepaintBoundary**:
```dart
RepaintBoundary(
  child: ComplexAnimatedWidget(),  // Isolates repaints
)
```

### 4. ListView Optimization

**Use ListView.builder for large lists**:
```dart
// Bad - builds all items at once
ListView(
  children: items.map((item) => ItemWidget(item)).toList(),
)

// Good - builds items lazily
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

**Add item extents for better scrolling**:
```dart
ListView.builder(
  itemCount: items.length,
  itemExtent: 80,  // Fixed height improves performance
  itemBuilder: (context, index) => ItemWidget(items[index]),
)

// Or use prototypeItem
ListView.builder(
  itemCount: items.length,
  prototypeItem: const ItemWidget(null),  // Measure from prototype
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

**Cache extent for smoother scrolling**:
```dart
ListView.builder(
  cacheExtent: 500,  // Pre-build items 500 pixels ahead
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

**Use keys for efficient updates**:
```dart
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id),  // Helps Flutter identify items
    item: items[index],
  ),
)
```

### 5. Image Optimization

**Resize images for display size**:
```dart
Image.network(
  'https://example.com/large-image.jpg',
  cacheWidth: 400,   // Decode at display size
  cacheHeight: 300,
)
```

**Use cached_network_image**:
```dart
import 'package:cached_network_image/cached_network_image.dart';

CachedNetworkImage(
  imageUrl: 'https://example.com/image.jpg',
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  memCacheWidth: 400,
  memCacheHeight: 300,
)
```

**Precache images**:
```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  precacheImage(
    const AssetImage('assets/hero_image.png'),
    context,
  );
}
```

**Use appropriate image formats**:
- PNG: Icons, images with transparency
- JPEG: Photos, complex images
- WebP: Best compression, modern alternative
- SVG (flutter_svg): Vector graphics that scale

### 6. Startup Time Optimization

**Defer initialization**:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Show app immediately
  runApp(const MyApp());

  // Initialize services after first frame
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    await _initializeServices();
  });
}

Future<void> _initializeServices() async {
  // Heavy initialization here
  await Firebase.initializeApp();
  await HiveBox.initialize();
  await CacheManager.initialize();
}
```

**Lazy loading**:
```dart
// Lazy singleton
class HeavyService {
  static HeavyService? _instance;
  static HeavyService get instance => _instance ??= HeavyService._();
  HeavyService._();
}

// Lazy initialization with Riverpod
final heavyServiceProvider = Provider((ref) {
  return HeavyService();  // Created only when first accessed
});
```

**Reduce main isolate work**:
```dart
import 'package:flutter/foundation.dart';

// Move heavy computation to isolate
Future<List<Item>> parseItems(String json) async {
  return compute(_parseItemsIsolate, json);
}

List<Item> _parseItemsIsolate(String json) {
  final data = jsonDecode(json) as List;
  return data.map((e) => Item.fromJson(e)).toList();
}
```

### 7. Memory Optimization

**Monitor memory in DevTools**:
- Heap snapshot analysis
- Allocation tracking
- Memory leak detection

**Dispose controllers and streams**:
```dart
class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  late final TextEditingController _controller;
  late final StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
    _subscription = myStream.listen(_onData);
  }

  @override
  void dispose() {
    _controller.dispose();
    _subscription.cancel();
    super.dispose();
  }
}
```

**Avoid memory leaks with callbacks**:
```dart
// Bad - can leak if widget is disposed
void initState() {
  super.initState();
  api.fetchData().then((data) {
    setState(() => _data = data);  // May call setState after dispose
  });
}

// Good - check if mounted
void initState() {
  super.initState();
  api.fetchData().then((data) {
    if (mounted) {
      setState(() => _data = data);
    }
  });
}

// Better - use async/await pattern
Future<void> _loadData() async {
  final data = await api.fetchData();
  if (!mounted) return;
  setState(() => _data = data);
}
```

### 8. Network Optimization

**Implement caching**:
```dart
import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';

final cacheOptions = CacheOptions(
  store: MemCacheStore(),
  policy: CachePolicy.request,
  maxStale: const Duration(days: 7),
);

final dio = Dio()
  ..interceptors.add(DioCacheInterceptor(options: cacheOptions));
```

**Compress requests**:
```dart
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    options.headers['Accept-Encoding'] = 'gzip';
    handler.next(options);
  },
));
```

**Pagination**:
```dart
class PaginatedList<T> {
  final List<T> items = [];
  int _page = 0;
  bool _hasMore = true;

  Future<void> loadMore() async {
    if (!_hasMore) return;

    final response = await api.getItems(page: _page);
    items.addAll(response.items);
    _hasMore = response.hasMore;
    _page++;
  }
}
```

### 9. Animation Optimization

**Use Impeller-friendly patterns**:
```dart
// Good - hardware accelerated
AnimatedContainer(
  duration: const Duration(milliseconds: 300),
  transform: Matrix4.translationValues(x, y, 0),
  child: content,
)

// Avoid - can cause jank
CustomPaint(
  painter: ComplexPainter(),  // Runs on UI thread
)
```

**Pre-compile shaders** (for SkiaGL, less relevant with Impeller):
```bash
# Generate shader warmup data
flutter drive --profile --cache-sksl

# Use in release build
flutter build apk --bundle-sksl-path=flutter_01.sksl.json
```

**Use AnimationController efficiently**:
```dart
class _MyState extends State<MyWidget> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,  // Prevents animation when widget is not visible
      duration: const Duration(milliseconds: 300),
    );
  }
}
```

### 10. Build Performance

**Analyze build size**:
```bash
# Generate size analysis
flutter build apk --analyze-size

# Web build analysis
flutter build web --source-maps
npx source-map-explorer build/web/main.dart.js
```

**Tree shaking**:
```dart
// Import only what you need
import 'package:flutter/material.dart' show Icons;

// Avoid barrel exports in large packages
// Bad: import 'package:my_package/my_package.dart';
// Good: import 'package:my_package/specific_feature.dart';
```

**Deferred loading** (web):
```dart
import 'package:heavy_feature/heavy_feature.dart' deferred as heavy;

Future<void> loadFeature() async {
  await heavy.loadLibrary();
  // Now use heavy.HeavyWidget()
}
```

### 11. Performance Testing

**Integration test with tracing**:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('scrolling performance', (tester) async {
    await tester.pumpWidget(const MyApp());

    // Start tracing
    await binding.traceAction(() async {
      // Perform actions
      await tester.fling(
        find.byType(ListView),
        const Offset(0, -500),
        1000,
      );
      await tester.pumpAndSettle();
    }, reportKey: 'scrolling_performance');
  });
}
```

Run performance test:
```bash
flutter drive \
  --driver=test_driver/integration_test.dart \
  --target=integration_test/performance_test.dart \
  --profile
```

### 12. Performance Audit Checklist

```
Performance Audit Report
========================

□ Startup Time
  - [ ] Deferred non-critical initialization
  - [ ] Lazy-loaded heavy services
  - [ ] Splash screen optimized

□ Rendering
  - [ ] Const widgets where possible
  - [ ] RepaintBoundary for animations
  - [ ] Widget splitting for rebuilds
  - [ ] Frame rate consistent (60+ FPS)

□ Lists
  - [ ] ListView.builder for long lists
  - [ ] Item extent specified
  - [ ] Keys for list items
  - [ ] Pagination implemented

□ Images
  - [ ] Cached and sized appropriately
  - [ ] Proper format selection
  - [ ] Precaching for critical images

□ Memory
  - [ ] Controllers disposed
  - [ ] Streams cancelled
  - [ ] No setState after dispose
  - [ ] No memory leaks detected

□ Network
  - [ ] Response caching
  - [ ] Request compression
  - [ ] Pagination for large datasets

□ Build
  - [ ] APK/IPA size optimized
  - [ ] Tree shaking effective
  - [ ] Obfuscation enabled (release)
```

## Output Summary

```
Performance Analysis Complete
=============================

Areas Analyzed:
- Startup: 1.2s cold start (target: <1s)
- Rendering: 58 FPS average (target: 60 FPS)
- Memory: 45MB peak (acceptable)
- Build Size: 18MB APK (good)

Issues Found:
1. [HIGH] Unnecessary rebuilds in ProductList widget
2. [MEDIUM] Images not cached in Gallery screen
3. [LOW] Heavy computation on main isolate

Recommendations:
1. Add const to ProductCard widget
2. Implement CachedNetworkImage in Gallery
3. Move JSON parsing to compute() isolate

Next Steps:
1. Apply recommended optimizations
2. Re-run profile to verify improvements
3. Set up performance regression tests
```

## Agent Reference

For detailed performance analysis and optimization strategies, consult the `flutter-performance-analyst` agent. For architecture patterns that promote performance, consult the `flutter-architect` agent.
