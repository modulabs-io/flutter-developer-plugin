# CLAUDE.md - Flutter Developer Plugin

This file provides comprehensive context for Claude Code when working on the `modulabs-io/flutter-developer-plugin` repository.

## Repository Overview

**Name:** flutter-developer-plugin
**Description:** A comprehensive Claude Code plugin that teaches Claude how to develop Flutter applications properly, supporting both desktop (Windows, macOS, Linux) and mobile (iOS, Android) development.
**License:** MIT
**Repository:** https://github.com/modulabs-io/flutter-developer-plugin

### Purpose

This plugin extends Claude Code's capabilities for Flutter development by providing:
- Specialized agents for different Flutter domains
- Slash command skills for common tasks
- Commands for feature scaffolding
- Hooks for automated formatting and analysis
- MCP server integrations

## Repository Structure

```
flutter-developer-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest and configuration
├── agents/                   # 21 specialized Flutter agents
│   ├── flutter-architect.md
│   ├── flutter-state-manager.md
│   ├── flutter-widget-builder.md
│   ├── flutter-test-engineer.md
│   ├── flutter-performance-analyst.md
│   ├── flutter-codegen-assistant.md
│   ├── flutter-ffi-native.md
│   ├── flutter-i18n-expert.md
│   ├── flutter-firebase-*.md     # Firebase agents (4)
│   ├── flutter-supabase-*.md     # Supabase agents (4)
│   └── flutter-*-platform.md     # Platform agents (5)
├── skills/                   # 43 slash command skills
│   ├── flutter-create/
│   ├── flutter-test/
│   ├── flutter-build/
│   ├── flutter-analyze/
│   ├── flutter-codegen/
│   ├── flutter-doctor/
│   ├── flutter-migrate/
│   ├── flutter-accessibility/
│   ├── flutter-pub/
│   ├── flutter-i18n/
│   ├── flutter-splash/
│   ├── flutter-ai-rules/
│   ├── flutter-run-configs/
│   ├── flutter-ffi-*/             # FFI skills (4)
│   ├── flutter-firebase-*/        # Firebase skills (4)
│   ├── flutter-supabase-*/        # Supabase skills (4)
│   └── flutter-*-platform/        # Platform skills (9)
├── commands/                 # Feature scaffolding commands
│   ├── flutter-new-feature.md
│   ├── flutter-add-state.md
│   └── flutter-platform-setup.md
├── hooks/
│   └── hooks.json            # Automated hooks configuration
├── .mcp.json                 # MCP server configurations
├── CLAUDE.md                 # This file
├── README.md                 # Project documentation
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
└── CODE_OF_CONDUCT.md        # Community guidelines
```

## File Formats and Patterns

### Agent Files (`agents/*.md`)

Agents use YAML frontmatter followed by Markdown content:

```markdown
---
name: flutter-{domain}
description: Brief description of the agent's expertise
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
  - WebSearch
---

# Agent Title

Introduction paragraph explaining the agent's role.

## Core Responsibilities

1. **Responsibility One**: Description
2. **Responsibility Two**: Description

## Detailed Guidance

### Topic One

Content with code examples...

### Topic Two

More content...

## Decision Guidelines

When to use certain approaches...

## Questions to Ask

Questions to help guide decisions...
```

**Agent Categories:**
- **Core**: Architecture, state management, widgets, testing, performance, codegen, FFI, i18n
- **Firebase**: Core setup, authentication, Firestore, other services
- **Supabase**: Core setup, authentication, database, other services
- **Platform**: iOS, Android, macOS, Windows, Linux

### Skill Files (`skills/*/SKILL.md`)

Skills are slash commands with this structure:

```markdown
# /flutter-{action}

Brief description of what the skill does.

## Usage

```
/flutter-{action} <required_arg> [optional_args]
```

## Arguments

- `required_arg`: Description (required)

## Options

- `--option <value>`: Description (default: value)

## Examples

```
/flutter-{action} example1
/flutter-{action} example2 --option value
```

## Instructions

When the user invokes `/flutter-{action}`, follow these steps:

### 1. First Step

Details and code examples...

### 2. Second Step

More details...

## Agent Reference

For additional guidance, consult the `flutter-{related-agent}` agent.
```

### Command Files (`commands/*.md`)

Commands follow similar structure to skills but are invoked differently and typically generate scaffolding.

### Hooks Configuration (`hooks/hooks.json`)

```json
{
  "hooks": {
    "PostToolUse": [...],
    "PreCommit": [...],
    "SessionStart": [...],
    "PreToolUse": [...]
  },
  "settings": {
    "autoFormat": true,
    "analyzeOnSave": true
  }
}
```

## Naming Conventions

### Files
- **Agents**: `flutter-{domain}.md` (kebab-case)
- **Skills**: `flutter-{action}/SKILL.md` in skill directory
- **Commands**: `flutter-{command-name}.md`

### Code Examples
- Use Dart/Flutter best practices
- Include language specifiers in code blocks (```dart, ```yaml, ```bash)
- Show both simple and advanced usage patterns

## Development Workflow

### Trunk-Based Development

This repository uses trunk-based development:

1. **Work directly on `main`** for small changes or use short-lived feature branches (< 1 day)
2. **No long-running branches** - merge frequently
3. **Pull latest before starting work**: `git pull origin main`
4. **Keep changes small and focused**

### Conventional Commits

All commits must follow the Conventional Commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New agent, skill, or command
- `fix` - Bug fix in existing content
- `docs` - Documentation changes (README, CONTRIBUTING)
- `refactor` - Restructure without behavior change
- `chore` - Maintenance (configs, dependencies)

**Scopes:**
- `agents` - Changes to agents/
- `skills` - Changes to skills/
- `commands` - Changes to commands/
- `hooks` - Changes to hooks/
- `mcp` - Changes to .mcp.json
- `plugin` - Changes to .claude-plugin/

**Examples:**
```bash
feat(agents): add flutter-web-platform agent
fix(skills): correct flutter-build iOS signing steps
docs: update README with installation instructions
chore(hooks): add pre-push validation hook
refactor(agents): reorganize flutter-architect sections
```

## Contributing Guidelines

### Adding a New Agent

1. Create `agents/flutter-{domain}.md`
2. Use the standard YAML frontmatter structure
3. Include comprehensive guidance with code examples
4. Update `plugin.json` agent count and categories
5. Commit: `feat(agents): add flutter-{domain} agent`

Example structure:
```markdown
---
name: flutter-{domain}
description: {Domain} expert for Flutter development
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Flutter {Domain} Agent

You are a Flutter {domain} expert...

## Core Responsibilities

...

## Patterns and Examples

...
```

### Adding a New Skill

1. Create directory: `skills/flutter-{action}/`
2. Create `skills/flutter-{action}/SKILL.md`
3. Follow the skill file structure with Usage, Options, Examples, Instructions
4. Update `plugin.json` skill count and categories
5. Commit: `feat(skills): add flutter-{action} skill`

### Modifying Existing Content

1. Read the existing file to understand current structure
2. Make targeted changes without restructuring unnecessarily
3. Ensure code examples remain valid and practical
4. Test any bash commands or code snippets
5. Commit with appropriate type: `fix(agents): ...` or `refactor(skills): ...`

### Documentation Updates

1. Keep README.md synchronized with actual content
2. Update CHANGELOG.md for significant changes
3. Commit: `docs: update README with new skill documentation`

## Testing and Verification

### Before Committing

1. **Validate YAML frontmatter**: Ensure proper formatting
2. **Check code blocks**: Verify language specifiers are correct
3. **Test bash commands**: Run any shell commands to verify correctness
4. **Cross-reference**: Ensure agent references in skills exist
5. **Count verification**: Verify agent/skill counts in plugin.json match actual files

### Validation Commands

```bash
# Count agents
ls -1 agents/*.md | wc -l

# Count skills
ls -1 skills/*/SKILL.md | wc -l

# Verify Dart code syntax (if Flutter SDK available)
dart analyze

# Check for broken internal references
grep -r "flutter-.*agent" skills/ | grep -v "#"
```

## Plugin Configuration

### plugin.json Structure

The plugin manifest at `.claude-plugin/plugin.json` defines:
- Plugin metadata (name, version, description)
- Capabilities (agents, skills, commands, hooks, mcp)
- Agent and skill categories
- Configuration options (state management, architecture, platforms)

### MCP Server Configuration

The `.mcp.json` file configures 13 Model Context Protocol servers:

| Server | Package | Purpose |
|--------|---------|---------|
| `dart-flutter` | `dart mcp-server` | Dart/Flutter analysis |
| `pubdev` | `@anthropic/pubdev-mcp-server` | pub.dev package search |
| `flutter-community` | `flutter-mcp` | Community Flutter tools |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | File operations |
| `git` | `@modelcontextprotocol/server-git` | Git operations |
| `github` | `@modelcontextprotocol/server-github` | GitHub API |
| `supabase` | `@supabase/mcp-server-supabase` | Supabase backend |
| `postgres` | `@modelcontextprotocol/server-postgres` | PostgreSQL |
| `sqlite` | `@modelcontextprotocol/server-sqlite` | SQLite |
| `xcode-build` | `xcodebuildmcp` | Xcode project management |
| `app-store-connect` | `@joshuarileydev/app-store-connect-mcp-server` | App Store Connect |
| `android-replicant` | `@anthropic/replicant-mcp` | Android automation |
| `chrome-devtools` | `chrome-devtools-mcp` | Chrome DevTools |

Required environment variables: `GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL`, `ANDROID_HOME`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_PRIVATE_KEY`

## Architecture Patterns

When creating or modifying content, follow these Flutter architectural patterns:

### Feature-First Architecture (Recommended)

```
lib/
├── core/           # Shared utilities, theme, constants
├── features/       # Feature modules with data/domain/presentation
├── shared/         # Shared widgets and services
└── main.dart
```

### Layer-First Architecture (Simple projects)

```
lib/
├── data/           # Data sources, models, repositories
├── domain/         # Entities, repository interfaces, use cases
├── presentation/   # Pages, widgets, state management
└── main.dart
```

## State Management Support

This plugin supports three state management solutions:

1. **Riverpod** (recommended) - Modern, compile-safe, testable
2. **Bloc** - Predictable state, good for large teams
3. **Provider** - Simple, good for small projects

Agents and skills should provide examples for all supported solutions where applicable.

## Flutter 3.38+ Features

When creating or modifying content, leverage these modern Flutter features:

### Edge-to-Edge Display (Android 15+)

```dart
// Enabled by default in Flutter 3.38+ for Android 15+
// Handle system UI overlaps with SafeArea and MediaQuery.padding
```

### Impeller Rendering Engine

- Default on iOS and Android
- Improved performance and reduced shader compilation jank
- Consider when writing performance-related guidance

### Native Assets (FFI)

```dart
// pubspec.yaml
flutter:
  assets:
    - native_assets/
```

### Web Assembly (Wasm) Support

```bash
# Build for WebAssembly
flutter build web --wasm
```

## Platform Support

The plugin covers all Flutter platforms:

- **Mobile**: iOS, Android
- **Desktop**: macOS, Windows, Linux
- **Web**: Supported but specialized web agent pending

Each platform has dedicated agents and skills for platform-specific concerns (signing, packaging, native integrations).

## Quick Reference

### Common Tasks

| Task | Command/Approach |
|------|-----------------|
| Create new project | `/flutter-create my_app` |
| Add new feature | `/flutter-new-feature feature_name` |
| Run tests | `/flutter-test --coverage` |
| Build release | `/flutter-build android --release` |
| Analyze code | `/flutter-analyze` |
| Generate code | `/flutter-codegen` |

### Agent Selection

| Need | Agent |
|------|-------|
| Project structure | `flutter-architect` |
| State management | `flutter-state-manager` |
| UI components | `flutter-widget-builder` |
| Testing strategy | `flutter-test-engineer` |
| Performance issues | `flutter-performance-analyst` |
| Native code/FFI | `flutter-ffi-native` |
| Firebase setup | `flutter-firebase-core` |
| Supabase setup | `flutter-supabase-core` |
| iOS specifics | `flutter-ios-platform` |
| Android specifics | `flutter-android-platform` |

## Important Notes

- Always use code blocks with language specifiers (```dart, ```yaml, etc.)
- Provide practical, copy-pasteable examples
- Reference official Flutter documentation where appropriate
- Keep content up-to-date with latest Flutter/Dart versions (3.38+/3.7+)
- Consider accessibility in all UI-related guidance
- Include error handling patterns in code examples
