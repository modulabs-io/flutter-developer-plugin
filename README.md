# Flutter Developer Plugin for Claude Code

A comprehensive Claude Code plugin that teaches Claude how to develop Flutter applications properly, supporting both desktop (Windows, macOS, Linux) and mobile (iOS, Android) development.

## Features

- **21 Specialized Agents** for Flutter development guidance
- **33 Slash Commands** for common development tasks
- **Multi-Platform Support**: iOS, Android, macOS, Windows, Linux, Web (Wasm)
- **State Management**: Riverpod, Bloc, and Provider
- **Backend Integrations**: Firebase and Supabase
- **Native/FFI Support**: C, Rust, and Java/Kotlin interop with native assets
- **Internationalization**: Complete i18n/l10n support
- **Flutter AI Rules**: Integration with official Flutter AI guidelines
- **Modern Rendering**: Impeller engine support (default on iOS/Android)
- **Edge-to-Edge**: Android 15+ edge-to-edge display support

## Installation

```bash
# Clone the plugin
git clone https://github.com/modulabs-io/flutter-developer-plugin.git

# Use with Claude Code
claude --plugin-dir ./flutter-developer-plugin
```

## Quick Start

```bash
# Create a new Flutter project
/flutter-create my_app --state riverpod --platforms ios,android,macos

# Run code analysis
/flutter-analyze

# Run tests with coverage
/flutter-test --coverage

# Build for release
/flutter-build android --release
```

## Available Skills (Slash Commands)

### Core Flutter Skills
| Command | Description |
|---------|-------------|
| `/flutter-create` | Create new projects with configurable architecture |
| `/flutter-test` | Run tests with coverage analysis |
| `/flutter-build` | Build for any platform with signing |
| `/flutter-analyze` | Static analysis and auto-fix |
| `/flutter-codegen` | Run build_runner and code generation |
| `/flutter-doctor` | Environment diagnostics |
| `/flutter-migrate` | SDK and architecture migration |
| `/flutter-accessibility` | WCAG compliance auditing |
| `/flutter-pub` | Dependency management |
| `/flutter-i18n` | Internationalization and localization setup |
| `/flutter-splash` | Splash screen configuration |
| `/flutter-ai-rules` | Generate AI assistant rules for your editor |
| `/flutter-run-configs` | Generate VS Code/JetBrains run configurations |

### Native/FFI Skills
| Command | Description |
|---------|-------------|
| `/flutter-ffi-init` | Initialize FFI project structure |
| `/flutter-ffigen` | Generate Dart bindings from C headers |
| `/flutter-jnigen` | Generate Java/Kotlin bindings |
| `/flutter-rust-bridge` | Set up Rust FFI integration |

### Firebase Skills
| Command | Description |
|---------|-------------|
| `/flutter-firebase-init` | FlutterFire CLI setup |
| `/flutter-firebase-auth` | Add Firebase Authentication |
| `/flutter-firebase-db` | Firestore/RTDB setup |
| `/flutter-firebase-deploy` | Deploy rules and functions |

### Supabase Skills
| Command | Description |
|---------|-------------|
| `/flutter-supabase-init` | Supabase CLI setup |
| `/flutter-supabase-auth` | Add Supabase Authentication |
| `/flutter-supabase-db` | Database and migrations |
| `/flutter-supabase-deploy` | Deploy Edge Functions |

### Platform Skills
| Command | Description |
|---------|-------------|
| `/flutter-ios-pods` | CocoaPods management |
| `/flutter-ios-signing` | iOS certificates and profiles |
| `/flutter-android-gradle` | Gradle configuration |
| `/flutter-android-signing` | Keystore and signing |
| `/flutter-android-adb` | ADB device management |
| `/flutter-macos-package` | DMG and notarization |
| `/flutter-windows-package` | MSIX packaging |
| `/flutter-linux-package` | Snap/Flatpak/AppImage |

## Specialized Agents

### Core Flutter Agents
- **flutter-architect**: Project structure and architecture patterns
- **flutter-state-manager**: State management (Riverpod/Bloc/Provider)
- **flutter-widget-builder**: Widget development and accessibility
- **flutter-test-engineer**: Testing strategies and implementation
- **flutter-performance-analyst**: Performance optimization
- **flutter-codegen-assistant**: Code generation workflows
- **flutter-ffi-native**: FFI and native code interop
- **flutter-i18n-expert**: Internationalization and localization patterns

### Firebase Agents
- **flutter-firebase-core**: FlutterFire CLI and setup
- **flutter-firebase-auth**: Authentication patterns
- **flutter-firebase-firestore**: Cloud Firestore patterns
- **flutter-firebase-services**: Storage, FCM, Analytics, Crashlytics

### Supabase Agents
- **flutter-supabase-core**: Supabase CLI and setup
- **flutter-supabase-auth**: Authentication patterns
- **flutter-supabase-database**: PostgreSQL and RLS
- **flutter-supabase-services**: Storage, Edge Functions, Realtime

### Platform Agents
- **flutter-ios-platform**: iOS development and App Store
- **flutter-android-platform**: Android development and Play Store
- **flutter-macos-platform**: macOS development and notarization
- **flutter-windows-platform**: Windows development and MSIX
- **flutter-linux-platform**: Linux packaging (Snap/Flatpak/AppImage)

## Architecture Recommendations

### State Management Decision Matrix

| Project Size | Team Size | Recommendation |
|--------------|-----------|----------------|
| Small/Prototype | 1-2 | Provider or Riverpod |
| Medium | 2-5 | Riverpod |
| Large/Enterprise | 5+ | Bloc or Riverpod |

### Project Structure (Feature-First)

```
lib/
├── core/
│   ├── constants/
│   ├── extensions/
│   ├── theme/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── home/
│   └── settings/
├── shared/
│   ├── widgets/
│   └── services/
└── main.dart
```

## MCP Server Integrations

The plugin configures recommended MCP servers for enhanced functionality:

- **Dart/Flutter MCP**: Code analysis, pub.dev search, test running
- **Filesystem**: File operations with permission model
- **Git/GitHub**: Repository and PR management
- **Supabase MCP**: Database design, migrations, RLS
- **Xcode MCP**: iOS/macOS project management
- **Replicant**: Android development automation

## Hooks

The plugin includes automated hooks for:

- **Post-Write**: Auto-format Dart files
- **Pre-Commit**: Run analyzer and format check
- **Session Start**: Display Flutter version

## Configuration

Edit `.claude-plugin/plugin.json` to customize:

```json
{
  "configuration": {
    "stateManagement": {
      "default": "riverpod"
    },
    "architecture": {
      "default": "feature-first"
    },
    "platforms": {
      "default": ["ios", "android"]
    }
  }
}
```

## Flutter AI Rules Integration

Generate AI assistant rules files tailored to your project:

```bash
# Generate rules for Claude Code
/flutter-ai-rules generate --editor claude

# Generate rules for Cursor
/flutter-ai-rules generate --editor cursor

# Auto-detect editor and project configuration
/flutter-ai-rules generate
```

Supports: Claude Code (`CLAUDE.md`), Cursor (`.cursor/rules`), GitHub Copilot, Windsurf, VS Code.

See [Flutter AI Documentation](https://docs.flutter.dev/ai) for official guidelines.

## AI Assistant Integration

This repository includes configuration files for multiple AI coding assistants to help with development:

| Assistant | Configuration File(s) | Purpose |
|-----------|----------------------|---------|
| Claude Code | `CLAUDE.md` | Comprehensive context for Claude Code |
| Cursor | `.cursor/rules/plugin-development.mdc`, `.cursorrules` | Editor rules (MDC + legacy) |
| Gemini | `GEMINI.md`, `.gemini/styleguide.md` | CLI agent mode + code review |
| Jules | `AGENTS.md` | Agent documentation |

These files provide AI assistants with context about:
- Repository structure and purpose
- File formats and naming conventions
- Development workflow and commit conventions
- Contribution guidelines

## Development Workflow

### Trunk-Based Development

This project uses trunk-based development:

1. Work directly on `main` for small changes
2. Use short-lived feature branches (< 1 day) for larger changes
3. Pull latest before starting: `git pull origin main`
4. Keep changes small and focused
5. Merge frequently

### Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`

**Scopes:** `agents`, `skills`, `commands`, `hooks`, `mcp`, `plugin`

**Examples:**
```bash
feat(agents): add flutter-web-platform agent
fix(skills): correct flutter-build iOS signing steps
docs: update README with installation instructions
```

### Commit Linting

Install commitlint for automated validation:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
npx husky init
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Release Automation

Releases are automated via [Release Please](https://github.com/googleapis/release-please). Conventional commits automatically:
- Generate CHANGELOG entries
- Bump version numbers
- Create release PRs

## Requirements

- Flutter SDK 3.38+
- Dart SDK 3.7+
- Claude Code 1.0+

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

- Issues: [GitHub Issues](https://github.com/modulabs-io/flutter-developer-plugin/issues)
- Discussions: [GitHub Discussions](https://github.com/modulabs-io/flutter-developer-plugin/discussions)
