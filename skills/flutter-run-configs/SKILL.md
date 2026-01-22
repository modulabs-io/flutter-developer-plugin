# /flutter-run-configs

Generate IDE run/debug configurations for VS Code and JetBrains IDEs (Android Studio/IntelliJ).

## Usage

```
/flutter-run-configs [command] [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate run configurations (default) |
| `add` | Add a single configuration |
| `list` | List existing configurations |
| `clean` | Remove generated configurations |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--ide <name>` | Target IDE: `vscode`, `jetbrains`, `all` | `all` |
| `--flavors <list>` | Comma-separated flavors (e.g., `dev,staging,prod`) | none |
| `--platforms <list>` | Target platforms | auto-detect |
| `--entry <path>` | Custom entry point | `lib/main.dart` |
| `--with-tests` | Include test configurations | `true` |
| `--with-build` | Include build configurations | `true` |

## Examples

```bash
# Generate configs for all IDEs with auto-detection
/flutter-run-configs generate

# Generate only VS Code configs
/flutter-run-configs generate --ide vscode

# Generate with flavors
/flutter-run-configs generate --flavors dev,staging,prod

# Generate for specific platforms
/flutter-run-configs generate --platforms ios,android,macos

# Add a single custom configuration
/flutter-run-configs add --name "Dev (iPhone)" --flavor dev --platform ios

# Generate with custom entry points per flavor
/flutter-run-configs generate --flavors dev,prod --entry "lib/main_{flavor}.dart"
```

## VS Code Configuration

### Output Location
`.vscode/launch.json`

### Generated Configurations

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": []
    },
    {
      "name": "Profile",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "flutterMode": "profile"
    },
    {
      "name": "Release",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "flutterMode": "release"
    }
  ]
}
```

### With Flavors

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug (dev)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_dev.dart",
      "args": ["--flavor", "dev"]
    },
    {
      "name": "Debug (staging)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_staging.dart",
      "args": ["--flavor", "staging"]
    },
    {
      "name": "Debug (prod)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_prod.dart",
      "args": ["--flavor", "prod"]
    },
    {
      "name": "Release (prod)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_prod.dart",
      "flutterMode": "release",
      "args": ["--flavor", "prod"]
    }
  ]
}
```

### Platform-Specific Configurations

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug (Android)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "android"]
    },
    {
      "name": "Debug (iOS)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "ios"]
    },
    {
      "name": "Debug (macOS)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "macos"]
    },
    {
      "name": "Debug (Chrome)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "chrome"]
    },
    {
      "name": "Debug (Windows)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "windows"]
    },
    {
      "name": "Debug (Linux)",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["-d", "linux"]
    }
  ]
}
```

### Test Configurations

```json
{
  "name": "Run All Tests",
  "request": "launch",
  "type": "dart",
  "program": "test/",
  "args": []
},
{
  "name": "Run Tests with Coverage",
  "request": "launch",
  "type": "dart",
  "program": "test/",
  "args": ["--coverage"]
},
{
  "name": "Run Current Test File",
  "request": "launch",
  "type": "dart",
  "program": "${file}"
}
```

### Build Tasks (.vscode/tasks.json)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "flutter: build apk",
      "type": "shell",
      "command": "flutter build apk --release",
      "group": "build"
    },
    {
      "label": "flutter: build ios",
      "type": "shell",
      "command": "flutter build ios --release",
      "group": "build"
    },
    {
      "label": "flutter: build macos",
      "type": "shell",
      "command": "flutter build macos --release",
      "group": "build"
    },
    {
      "label": "flutter: build web",
      "type": "shell",
      "command": "flutter build web --release",
      "group": "build"
    },
    {
      "label": "dart: build_runner",
      "type": "shell",
      "command": "dart run build_runner build --delete-conflicting-outputs",
      "group": "build"
    },
    {
      "label": "flutter: clean",
      "type": "shell",
      "command": "flutter clean",
      "group": "build"
    },
    {
      "label": "flutter: analyze",
      "type": "shell",
      "command": "flutter analyze",
      "group": "test",
      "problemMatcher": "$dart-analyze"
    }
  ]
}
```

## JetBrains Configuration

### Output Location
`.run/*.run.xml`

Creates individual XML files for each configuration in the `.run/` directory, which is the standard location for shared run configurations in JetBrains IDEs.

### Generated Configurations

#### Debug Configuration
`.run/Debug.run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Debug" type="FlutterRunConfigurationType" factoryName="Flutter">
    <option name="filePath" value="$PROJECT_DIR$/lib/main.dart" />
    <option name="buildFlavor" value="" />
    <option name="additionalArgs" value="" />
    <method v="2" />
  </configuration>
</component>
```

#### Profile Configuration
`.run/Profile.run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Profile" type="FlutterRunConfigurationType" factoryName="Flutter">
    <option name="filePath" value="$PROJECT_DIR$/lib/main.dart" />
    <option name="buildFlavor" value="" />
    <option name="additionalArgs" value="--profile" />
    <method v="2" />
  </configuration>
</component>
```

#### Release Configuration
`.run/Release.run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Release" type="FlutterRunConfigurationType" factoryName="Flutter">
    <option name="filePath" value="$PROJECT_DIR$/lib/main.dart" />
    <option name="buildFlavor" value="" />
    <option name="additionalArgs" value="--release" />
    <method v="2" />
  </configuration>
</component>
```

### With Flavors

#### Dev Flavor
`.run/Debug (dev).run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Debug (dev)" type="FlutterRunConfigurationType" factoryName="Flutter">
    <option name="filePath" value="$PROJECT_DIR$/lib/main_dev.dart" />
    <option name="buildFlavor" value="dev" />
    <option name="additionalArgs" value="" />
    <method v="2" />
  </configuration>
</component>
```

#### Prod Flavor (Release)
`.run/Release (prod).run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Release (prod)" type="FlutterRunConfigurationType" factoryName="Flutter">
    <option name="filePath" value="$PROJECT_DIR$/lib/main_prod.dart" />
    <option name="buildFlavor" value="prod" />
    <option name="additionalArgs" value="--release" />
    <method v="2" />
  </configuration>
</component>
```

### Test Configuration
`.run/All Tests.run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="All Tests" type="FlutterTestConfigurationType" factoryName="Flutter Test">
    <option name="testScope" value="DIRECTORY" />
    <option name="testDirPath" value="$PROJECT_DIR$/test" />
    <method v="2" />
  </configuration>
</component>
```

### Build Configuration (Shell Script)
`.run/Build APK (release).run.xml`
```xml
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Build APK (release)" type="ShConfigurationType">
    <option name="SCRIPT_TEXT" value="flutter build apk --release" />
    <option name="INDEPENDENT_SCRIPT_PATH" value="true" />
    <option name="SCRIPT_PATH" value="" />
    <option name="SCRIPT_OPTIONS" value="" />
    <option name="INDEPENDENT_SCRIPT_WORKING_DIRECTORY" value="true" />
    <option name="SCRIPT_WORKING_DIRECTORY" value="$PROJECT_DIR$" />
    <method v="2" />
  </configuration>
</component>
```

## Configuration Matrix

When using flavors and platforms, generates a matrix of configurations:

| Flavor | Mode | Platform | Config Name |
|--------|------|----------|-------------|
| dev | debug | - | Debug (dev) |
| dev | profile | - | Profile (dev) |
| staging | debug | - | Debug (staging) |
| staging | release | - | Release (staging) |
| prod | debug | - | Debug (prod) |
| prod | release | - | Release (prod) |

With platform targeting:

| Flavor | Mode | Platform | Config Name |
|--------|------|----------|-------------|
| dev | debug | android | Debug (dev) - Android |
| dev | debug | ios | Debug (dev) - iOS |
| prod | release | android | Release (prod) - Android |
| prod | release | ios | Release (prod) - iOS |

## Advanced Options

### Environment Variables (VS Code)

```json
{
  "name": "Debug with Env",
  "request": "launch",
  "type": "dart",
  "program": "lib/main.dart",
  "env": {
    "API_URL": "https://api.dev.example.com",
    "DEBUG_MODE": "true"
  }
}
```

### Pre-Launch Tasks (VS Code)

```json
{
  "name": "Debug (with codegen)",
  "request": "launch",
  "type": "dart",
  "program": "lib/main.dart",
  "preLaunchTask": "dart: build_runner"
}
```

### Device Targeting

```json
{
  "name": "Debug (Pixel 6)",
  "request": "launch",
  "type": "dart",
  "program": "lib/main.dart",
  "deviceId": "emulator-5554"
}
```

## Flavor Entry Point Patterns

The skill supports different entry point patterns:

| Pattern | Example | Description |
|---------|---------|-------------|
| `lib/main.dart` | Single entry | No flavor-specific entry |
| `lib/main_{flavor}.dart` | `lib/main_dev.dart` | Per-flavor entry point |
| `lib/flavors/{flavor}/main.dart` | `lib/flavors/dev/main.dart` | Folder-based |
| `lib/app/{flavor}.dart` | `lib/app/dev.dart` | Custom structure |

Specify with `--entry`:
```bash
/flutter-run-configs generate --flavors dev,prod --entry "lib/main_{flavor}.dart"
```

## Integration with Other Skills

- `/flutter-create` - Generates initial run configs for new projects
- `/flutter-build` - References build configurations
- `/flutter-android-gradle` - Flavor configuration in Gradle

## Best Practices

1. **Commit configurations** - Share via version control (`.vscode/`, `.run/`)
2. **Use descriptive names** - Include flavor, mode, and platform
3. **Set default config** - Team should agree on default debug configuration
4. **Include test configs** - Make running tests easy
5. **Document custom args** - Comment unusual arguments

## Troubleshooting

### VS Code not showing configurations
- Ensure `.vscode/launch.json` is valid JSON
- Reload VS Code window
- Check Dart extension is installed

### JetBrains not detecting configurations
- Ensure files are in `.run/` directory (not `.idea/runConfigurations/`)
- Invalidate caches and restart
- Check file permissions

### Flavor not applying
- Verify flavor is defined in `android/app/build.gradle`
- Check iOS scheme exists for flavor
- Ensure entry point file exists

## Related

- `/flutter-create` - Project scaffolding with configs
- `/flutter-build` - Build commands
- `flutter-android-platform` agent - Android flavor setup
- `flutter-ios-platform` agent - iOS scheme setup
