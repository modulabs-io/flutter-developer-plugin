# /flutter-rust-bridge

Set up flutter_rust_bridge for Rust FFI integration.

## Usage

```
/flutter-rust-bridge [command] [options]
```

## Commands

- `init`: Initialize Rust integration in existing Flutter project
- `generate`: Generate Dart bindings from Rust code
- `build`: Build Rust library for target platform

## Options

- `--name <name>`: Rust library name (default: native)
- `--android`: Build for Android
- `--ios`: Build for iOS
- `--macos`: Build for macOS
- `--windows`: Build for Windows
- `--linux`: Build for Linux

## Examples

```
/flutter-rust-bridge init
/flutter-rust-bridge generate
/flutter-rust-bridge build --android --ios
```

## Instructions

When the user invokes `/flutter-rust-bridge`, follow these steps:

### 1. Install Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install flutter_rust_bridge_codegen
cargo install flutter_rust_bridge_codegen

# Android targets
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android

# iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim

# macOS (already native, but add if needed)
# rustup target add x86_64-apple-darwin aarch64-apple-darwin

# For Android NDK
cargo install cargo-ndk
```

### 2. Initialize Rust Integration

```bash
# From Flutter project root
flutter_rust_bridge_codegen create
```

This creates:
```
rust/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   └── api/
│       ├── mod.rs
│       └── simple.rs
```

### 3. Configure Cargo.toml

```toml
# rust/Cargo.toml
[package]
name = "rust_lib"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "staticlib"]
name = "rust_lib"

[dependencies]
flutter_rust_bridge = "=2.0.0"
# Add your Rust dependencies here
tokio = { version = "1", features = ["rt-multi-thread"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[build-dependencies]
flutter_rust_bridge_codegen = "=2.0.0"

# Profile optimizations
[profile.release]
lto = true
codegen-units = 1
opt-level = 3
strip = true
```

### 4. Write Rust Code

```rust
// rust/src/api/simple.rs

// Simple synchronous function
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

// Struct with methods
pub struct Counter {
    value: i32,
}

impl Counter {
    pub fn new(initial: i32) -> Self {
        Counter { value: initial }
    }

    pub fn increment(&mut self) -> i32 {
        self.value += 1;
        self.value
    }

    pub fn decrement(&mut self) -> i32 {
        self.value -= 1;
        self.value
    }

    pub fn get_value(&self) -> i32 {
        self.value
    }
}

// Async function
pub async fn fetch_data(url: String) -> Result<String, String> {
    // Simulated async operation
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    Ok(format!("Data from: {}", url))
}

// Error handling
#[derive(Debug)]
pub enum AppError {
    Network(String),
    Parse(String),
    Unknown,
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Network(msg) => write!(f, "Network error: {}", msg),
            AppError::Parse(msg) => write!(f, "Parse error: {}", msg),
            AppError::Unknown => write!(f, "Unknown error"),
        }
    }
}

pub fn risky_operation(input: &str) -> Result<String, AppError> {
    if input.is_empty() {
        Err(AppError::Parse("Input cannot be empty".into()))
    } else {
        Ok(format!("Processed: {}", input))
    }
}
```

```rust
// rust/src/api/complex.rs

use std::sync::Arc;
use tokio::sync::Mutex;

// Complex struct with interior mutability
pub struct SharedState {
    data: Arc<Mutex<Vec<String>>>,
}

impl SharedState {
    pub fn new() -> Self {
        SharedState {
            data: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn add_item(&self, item: String) {
        let mut data = self.data.lock().await;
        data.push(item);
    }

    pub async fn get_items(&self) -> Vec<String> {
        let data = self.data.lock().await;
        data.clone()
    }

    pub async fn clear(&self) {
        let mut data = self.data.lock().await;
        data.clear();
    }
}

// Stream (yields multiple values)
pub fn counter_stream(start: i32, end: i32) -> impl futures::Stream<Item = i32> {
    futures::stream::iter(start..=end)
}

// Callback pattern
pub fn process_with_callback<F>(items: Vec<String>, callback: F)
where
    F: Fn(usize, &str) + Send + 'static,
{
    for (index, item) in items.iter().enumerate() {
        callback(index, item);
    }
}
```

```rust
// rust/src/api/mod.rs
pub mod simple;
pub mod complex;
```

```rust
// rust/src/lib.rs
mod api;

pub use api::*;
```

### 5. Generate Bindings

```bash
# Generate Dart bindings
flutter_rust_bridge_codegen generate
```

This creates:
```
lib/
└── src/
    └── rust/
        ├── api/
        │   ├── simple.dart
        │   └── complex.dart
        ├── frb_generated.dart
        └── frb_generated.io.dart
```

### 6. Platform Configuration

#### Android

```groovy
// android/app/build.gradle
android {
    // ... existing config

    sourceSets {
        main {
            jniLibs.srcDirs = ['src/main/jniLibs']
        }
    }
}
```

```bash
# Build for Android
cargo ndk -t arm64-v8a -t armeabi-v7a -t x86_64 -o android/app/src/main/jniLibs build --release
```

#### iOS

```ruby
# ios/Podfile
target 'Runner' do
  # ... existing config

  # Add Rust library
  pod 'rust_lib', :path => '../rust'
end
```

```bash
# Build for iOS
cargo lipo --release
cp target/universal/release/librust_lib.a ios/
```

#### macOS

```ruby
# macos/Podfile
target 'Runner' do
  # ... existing config
  pod 'rust_lib', :path => '../rust'
end
```

#### Windows

```cmake
# windows/CMakeLists.txt
# Add after existing config
add_library(rust_lib SHARED IMPORTED GLOBAL)
set_property(TARGET rust_lib PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/../rust/target/release/rust_lib.dll")
target_link_libraries(${PLUGIN_NAME} PRIVATE rust_lib)
```

#### Linux

```cmake
# linux/CMakeLists.txt
add_library(rust_lib SHARED IMPORTED GLOBAL)
set_property(TARGET rust_lib PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/../rust/target/release/librust_lib.so")
target_link_libraries(${PLUGIN_NAME} PRIVATE rust_lib)
```

### 7. Use in Flutter

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'src/rust/api/simple.dart';
import 'src/rust/api/complex.dart';
import 'src/rust/frb_generated.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Rust library
  await RustLib.init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: const RustDemoPage(),
    );
  }
}

class RustDemoPage extends StatefulWidget {
  const RustDemoPage({super.key});

  @override
  State<RustDemoPage> createState() => _RustDemoPageState();
}

class _RustDemoPageState extends State<RustDemoPage> {
  String _result = '';
  Counter? _counter;

  @override
  void initState() {
    super.initState();
    _initCounter();
  }

  Future<void> _initCounter() async {
    _counter = await Counter.new_(initial: 0);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rust Bridge Demo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Simple function
            ElevatedButton(
              onPressed: () async {
                final result = await add(a: 5, b: 3);
                setState(() => _result = '5 + 3 = $result');
              },
              child: const Text('Add 5 + 3'),
            ),

            // Counter with state
            if (_counter != null) ...[
              const SizedBox(height: 16),
              Text('Counter: ${_counter!.getValue()}'),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () async {
                      await _counter!.increment();
                      setState(() {});
                    },
                    child: const Text('+'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () async {
                      await _counter!.decrement();
                      setState(() {});
                    },
                    child: const Text('-'),
                  ),
                ],
              ),
            ],

            // Async function
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final data = await fetchData(url: 'https://example.com');
                setState(() => _result = data);
              },
              child: const Text('Fetch Data'),
            ),

            // Stream
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final stream = counterStream(start: 1, end: 10);
                await for (final value in stream) {
                  setState(() => _result = 'Count: $value');
                  await Future.delayed(const Duration(milliseconds: 100));
                }
              },
              child: const Text('Start Stream'),
            ),

            // Result display
            const SizedBox(height: 24),
            Text('Result: $_result'),
          ],
        ),
      ),
    );
  }
}
```

### 8. Build Script

```bash
#!/bin/bash
# build_rust.sh

set -e

echo "Building Rust library..."

cd rust

# Android
if [ "$1" == "android" ] || [ "$1" == "all" ]; then
    echo "Building for Android..."
    cargo ndk -t arm64-v8a -t armeabi-v7a -t x86_64 -o ../android/app/src/main/jniLibs build --release
fi

# iOS
if [ "$1" == "ios" ] || [ "$1" == "all" ]; then
    echo "Building for iOS..."
    cargo lipo --release
    cp target/universal/release/librust_lib.a ../ios/
fi

# macOS
if [ "$1" == "macos" ] || [ "$1" == "all" ]; then
    echo "Building for macOS..."
    cargo build --release
    cp target/release/librust_lib.dylib ../macos/
fi

# Linux
if [ "$1" == "linux" ] || [ "$1" == "all" ]; then
    echo "Building for Linux..."
    cargo build --release
    cp target/release/librust_lib.so ../linux/
fi

# Windows
if [ "$1" == "windows" ] || [ "$1" == "all" ]; then
    echo "Building for Windows..."
    cargo build --release --target x86_64-pc-windows-msvc
    cp target/x86_64-pc-windows-msvc/release/rust_lib.dll ../windows/
fi

echo "Done!"
```

### 9. Output Summary

```
flutter_rust_bridge Setup Complete
===================================

Rust Library: rust/
Dart Bindings: lib/src/rust/

Created:
- rust/Cargo.toml
- rust/src/lib.rs
- rust/src/api/simple.rs
- lib/src/rust/api/simple.dart
- lib/src/rust/frb_generated.dart

Build Targets Configured:
- Android (arm64, arm32, x86_64)
- iOS (arm64, sim)
- macOS
- Windows
- Linux

Next Steps:
1. Write Rust code in rust/src/api/
2. Run `flutter_rust_bridge_codegen generate`
3. Build for target: `./build_rust.sh android`
4. Run app: `flutter run`
```

## Agent Reference

For advanced Rust/FFI patterns, consult the `flutter-ffi-native` agent.
