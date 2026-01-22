# AGENTS.md - Flutter Developer Plugin

Documentation for Jules and other AI coding agents working on this repository.

## Repository Overview

**Name:** flutter-developer-plugin
**Purpose:** Claude Code plugin for comprehensive Flutter development
**License:** MIT

This plugin provides specialized agents, skills (slash commands), and commands for Flutter development across all platforms.

## Agents Overview

### Agent Table

| Agent | Purpose | File |
|-------|---------|------|
| flutter-architect | Project structure and architecture patterns | `agents/flutter-architect.md` |
| flutter-state-manager | State management (Riverpod, Bloc, Provider) | `agents/flutter-state-manager.md` |
| flutter-widget-builder | Widget development and accessibility | `agents/flutter-widget-builder.md` |
| flutter-test-engineer | Testing strategies and implementation | `agents/flutter-test-engineer.md` |
| flutter-performance-analyst | Performance optimization | `agents/flutter-performance-analyst.md` |
| flutter-codegen-assistant | Code generation workflows | `agents/flutter-codegen-assistant.md` |
| flutter-ffi-native | FFI and native code interop | `agents/flutter-ffi-native.md` |
| flutter-i18n-expert | Internationalization patterns | `agents/flutter-i18n-expert.md` |
| flutter-firebase-core | FlutterFire CLI and setup | `agents/flutter-firebase-core.md` |
| flutter-firebase-auth | Firebase authentication | `agents/flutter-firebase-auth.md` |
| flutter-firebase-firestore | Cloud Firestore patterns | `agents/flutter-firebase-firestore.md` |
| flutter-firebase-services | Firebase Storage, FCM, Analytics | `agents/flutter-firebase-services.md` |
| flutter-supabase-core | Supabase CLI and setup | `agents/flutter-supabase-core.md` |
| flutter-supabase-auth | Supabase authentication | `agents/flutter-supabase-auth.md` |
| flutter-supabase-database | PostgreSQL and RLS | `agents/flutter-supabase-database.md` |
| flutter-supabase-services | Storage, Edge Functions, Realtime | `agents/flutter-supabase-services.md` |
| flutter-ios-platform | iOS development and App Store | `agents/flutter-ios-platform.md` |
| flutter-android-platform | Android development and Play Store | `agents/flutter-android-platform.md` |
| flutter-macos-platform | macOS development and notarization | `agents/flutter-macos-platform.md` |
| flutter-windows-platform | Windows development and MSIX | `agents/flutter-windows-platform.md` |
| flutter-linux-platform | Linux packaging | `agents/flutter-linux-platform.md` |

## Skills Overview

### Core Skills

| Skill | Purpose |
|-------|---------|
| `/flutter-create` | Create new projects with configurable architecture |
| `/flutter-test` | Run tests with coverage analysis |
| `/flutter-build` | Build for any platform with signing |
| `/flutter-analyze` | Static analysis and auto-fix |
| `/flutter-codegen` | Run build_runner and code generation |
| `/flutter-doctor` | Environment diagnostics |
| `/flutter-migrate` | SDK and architecture migration |
| `/flutter-accessibility` | WCAG compliance auditing |
| `/flutter-pub` | Dependency management |
| `/flutter-i18n` | Internationalization setup |
| `/flutter-splash` | Splash screen configuration |
| `/flutter-ai-rules` | Generate AI assistant rules |
| `/flutter-run-configs` | Generate IDE run configurations |

### FFI Skills

| Skill | Purpose |
|-------|---------|
| `/flutter-ffi-init` | Initialize FFI project structure |
| `/flutter-ffigen` | Generate Dart bindings from C headers |
| `/flutter-jnigen` | Generate Java/Kotlin bindings |
| `/flutter-rust-bridge` | Set up Rust FFI integration |

### Backend Skills

| Skill | Purpose |
|-------|---------|
| `/flutter-firebase-init` | FlutterFire CLI setup |
| `/flutter-firebase-auth` | Add Firebase Authentication |
| `/flutter-firebase-db` | Firestore/RTDB setup |
| `/flutter-firebase-deploy` | Deploy rules and functions |
| `/flutter-supabase-init` | Supabase CLI setup |
| `/flutter-supabase-auth` | Add Supabase Authentication |
| `/flutter-supabase-db` | Database and migrations |
| `/flutter-supabase-deploy` | Deploy Edge Functions |

### Platform Skills

| Skill | Purpose |
|-------|---------|
| `/flutter-ios-pods` | CocoaPods management |
| `/flutter-ios-signing` | iOS certificates and profiles |
| `/flutter-android-gradle` | Gradle configuration |
| `/flutter-android-signing` | Keystore and signing |
| `/flutter-android-adb` | ADB device management |
| `/flutter-macos-package` | DMG and notarization |
| `/flutter-windows-package` | MSIX packaging |
| `/flutter-linux-package` | Snap/Flatpak/AppImage |

## File Conventions

### Agent File Structure

Location: `agents/flutter-{domain}.md`

```markdown
---
name: flutter-{domain}
description: Brief description of expertise
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Flutter {Domain} Agent

Introduction paragraph.

## Core Responsibilities

1. **Responsibility One**: Description
2. **Responsibility Two**: Description

## Patterns and Examples

### Pattern One

Code examples and explanations...

## Decision Guidelines

When to use which approach...
```

### Skill File Structure

Location: `skills/flutter-{action}/SKILL.md`

```markdown
# /flutter-{action}

Brief description.

## Usage

\`\`\`
/flutter-{action} <required> [options]
\`\`\`

## Arguments

- `required`: Description (required)

## Options

- `--option <value>`: Description (default: value)

## Examples

\`\`\`
/flutter-{action} example --option value
\`\`\`

## Instructions

### 1. Step One

Implementation details...

## Agent Reference

For additional guidance, consult the `flutter-{agent}` agent.
```

## Development Workflow

### Trunk-Based Development

1. Work directly on `main` for small changes
2. Use short-lived feature branches (< 1 day) for larger changes
3. Pull latest before starting: `git pull origin main`
4. Keep changes small and focused
5. Merge frequently

### Conventional Commits

Format: `type(scope): description`

**Types:**
- `feat` - New agent, skill, or command
- `fix` - Bug fix in existing content
- `docs` - Documentation changes
- `refactor` - Restructure without behavior change
- `chore` - Maintenance tasks

**Scopes:**
- `agents` - Changes to agents/
- `skills` - Changes to skills/
- `commands` - Changes to commands/
- `hooks` - Changes to hooks/
- `mcp` - Changes to .mcp.json
- `plugin` - Changes to .claude-plugin/

**Examples:**
```
feat(agents): add flutter-web-platform agent
fix(skills): correct flutter-build iOS signing steps
docs: update README with installation instructions
chore(hooks): add pre-push validation hook
```

## Contribution Patterns

### Adding a New Agent

1. Create `agents/flutter-{domain}.md`
2. Use YAML frontmatter with name, description, allowed-tools
3. Include Core Responsibilities, Patterns, Decision Guidelines sections
4. Update `.claude-plugin/plugin.json` agent count and categories
5. Commit: `feat(agents): add flutter-{domain} agent`

### Adding a New Skill

1. Create directory `skills/flutter-{action}/`
2. Create `skills/flutter-{action}/SKILL.md`
3. Include Usage, Options, Examples, Instructions, Agent Reference
4. Update `.claude-plugin/plugin.json` skill count and categories
5. Commit: `feat(skills): add flutter-{action} skill`

### Modifying Existing Content

1. Read the existing file first
2. Make targeted changes
3. Ensure code examples remain valid
4. Commit with appropriate type (fix/refactor)

## Input/Output Conventions

### Agent Inputs

Agents receive context about:
- Current project structure
- State management solution in use
- Target platforms
- Backend integration (if any)

### Agent Outputs

Agents provide:
- Architectural guidance
- Code examples (Dart, YAML, bash)
- Decision matrices
- Step-by-step instructions

### Skill Inputs

Skills accept:
- Required arguments (e.g., project name)
- Optional flags (e.g., --state riverpod)
- Platform specifications (e.g., --platforms ios,android)

### Skill Outputs

Skills produce:
- Generated files/directories
- Configuration changes
- Terminal output/logs
- Summary of actions taken

## Verification

Before committing, verify:

1. **YAML Validity**: Frontmatter parses correctly
2. **Code Blocks**: All have language specifiers
3. **References**: Agent references in skills exist
4. **Counts**: plugin.json counts match actual files
5. **Examples**: Code is syntactically correct

```bash
# Count agents
ls -1 agents/*.md | wc -l  # Should be 21

# Count skills
ls -1 skills/*/SKILL.md | wc -l  # Should be 33
```
