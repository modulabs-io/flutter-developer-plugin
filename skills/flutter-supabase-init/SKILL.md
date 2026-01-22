# /flutter-supabase-init

Initialize Supabase in a Flutter project.

## Usage

```
/flutter-supabase-init [options]
```

## Options

- `--project <ref>`: Supabase project reference
- `--local`: Set up local development environment
- `--env <name>`: Environment name (dev, staging, prod)

## Examples

```
/flutter-supabase-init
/flutter-supabase-init --project abc123xyz
/flutter-supabase-init --local
```

## Instructions

When the user invokes `/flutter-supabase-init`, follow these steps:

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Verify
supabase --version
```

### 2. Add Flutter Dependencies

```bash
flutter pub add supabase_flutter
```

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.5.0
```

### 3. Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Initialize local config
supabase init

# Link to remote project
supabase link --project-ref {{project_ref}}
```

### 4. Get API Credentials

From Supabase Dashboard > Settings > API:
- Project URL: `https://{{project_ref}}.supabase.co`
- anon public key: `eyJ...`

### 5. Create Configuration

```dart
// lib/core/config/supabase_config.dart
class SupabaseConfig {
  // Use environment variables
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );
}
```

### 6. Initialize in main.dart

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/supabase_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );

  runApp(const MyApp());
}

// Global client accessor
final supabase = Supabase.instance.client;

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'My App',
      home: HomePage(),
    );
  }
}
```

### 7. Create Run Configuration

```bash
# Create launch script
# scripts/run_dev.sh
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJxxx

# Or use .env file
# .env.development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx

# Run with env file
flutter run --dart-define-from-file=.env.development
```

### 8. Local Development Setup (--local)

```bash
# Start local Supabase
supabase start

# Output will show:
# API URL: http://localhost:54321
# anon key: eyJ...local
# Studio URL: http://localhost:54323
```

```dart
// lib/main_local.dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'http://localhost:54321',
    anonKey: 'eyJ...local', // From supabase start output
  );

  runApp(const MyApp());
}
```

### 9. Configure Deep Links (for Auth)

#### iOS

```xml
<!-- ios/Runner/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>{{bundle_id}}</string>
        </array>
    </dict>
</array>
```

#### Android

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="{{package_name}}" android:host="login-callback" />
</intent-filter>
```

### 10. Update Supabase Dashboard

Add redirect URLs in Dashboard > Authentication > URL Configuration:
- Site URL: `{{bundle_id}}://login-callback`
- Redirect URLs: `{{bundle_id}}://login-callback`

### 11. Output Summary

```
Supabase Initialization Complete
================================

Project: {{project_ref}}
URL: https://{{project_ref}}.supabase.co

Files Created:
- lib/core/config/supabase_config.dart
- lib/main.dart (updated)
- .env.development

Dependencies Added:
- supabase_flutter: ^2.5.0

Local Development:
- Run: supabase start
- Studio: http://localhost:54323

Next Steps:
1. Add API credentials to .env file
2. Run with: flutter run --dart-define-from-file=.env.development
3. Or for local: flutter run -t lib/main_local.dart
```

## Agent Reference

For Supabase configuration details, consult the `flutter-supabase-core` agent.
