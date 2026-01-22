# GEMINI.md - Flutter Developer Plugin

Context file for Gemini CLI agent mode when working on this repository.

## Repository Overview

**Name:** flutter-developer-plugin
**Purpose:** Claude Code plugin for comprehensive Flutter development support
**License:** MIT
**Repository:** https://github.com/modulabs-io/flutter-developer-plugin

## What This Plugin Does

This plugin extends Claude Code's capabilities for Flutter development by providing:
- 21 specialized agents for different Flutter domains
- 33 slash command skills for common tasks
- 3 commands for feature scaffolding
- Hooks for automated formatting and analysis
- MCP server integrations

## Repository Structure

```
flutter-developer-plugin/
├── .claude-plugin/plugin.json   # Plugin manifest
├── agents/                      # 21 specialized agents
├── skills/                      # 33 slash command skills
├── commands/                    # 3 feature commands
├── hooks/hooks.json            # Hooks configuration
└── .mcp.json                   # MCP server configs
```

## File Formats

### Agent Files (`agents/flutter-*.md`)

YAML frontmatter with name, description, allowed-tools followed by Markdown:

```markdown
---
name: flutter-{domain}
description: Agent expertise description
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Agent Title

## Core Responsibilities
## Patterns and Examples
## Decision Guidelines
```

### Skill Files (`skills/flutter-*/SKILL.md`)

```markdown
# /flutter-{action}

## Usage
## Options
## Examples
## Instructions
## Agent Reference
```

## Development Workflow

### Trunk-Based Development

- Work directly on `main` or use short-lived feature branches (< 1 day)
- Pull latest before starting: `git pull origin main`
- Keep changes small and focused

### Conventional Commits

Format: `type(scope): description`

**Types:**
- `feat` - New agent, skill, or command
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code restructure
- `chore` - Maintenance

**Scopes:** agents, skills, commands, hooks, mcp, plugin

**Examples:**
```
feat(agents): add flutter-web-platform agent
fix(skills): correct flutter-build iOS signing steps
docs: update README with new skill documentation
```

## Key Patterns

### Naming Conventions

- Agents: `flutter-{domain}.md` (kebab-case)
- Skills: `flutter-{action}/SKILL.md`
- Commands: `flutter-{command}.md`

### Code Examples

- Always use language specifiers: ```dart, ```yaml, ```bash
- Provide practical, copy-pasteable examples
- Follow Flutter/Dart best practices

### Agent Categories

| Category | Agents |
|----------|--------|
| Core | architect, state-manager, widget-builder, test-engineer, performance-analyst, codegen-assistant, ffi-native, i18n-expert |
| Firebase | firebase-core, firebase-auth, firebase-firestore, firebase-services |
| Supabase | supabase-core, supabase-auth, supabase-database, supabase-services |
| Platform | ios-platform, android-platform, macos-platform, windows-platform, linux-platform |

### Skill Categories

| Category | Skills |
|----------|--------|
| Core | create, test, build, analyze, codegen, doctor, migrate, accessibility, pub, i18n, splash, ai-rules, run-configs |
| FFI | ffi-init, ffigen, jnigen, rust-bridge |
| Firebase | firebase-init, firebase-auth, firebase-db, firebase-deploy |
| Supabase | supabase-init, supabase-auth, supabase-db, supabase-deploy |
| Platform | ios-pods, ios-signing, android-gradle, android-signing, android-adb, macos-package, windows-package, linux-package |

## Contributing

### Adding an Agent

1. Create `agents/flutter-{domain}.md`
2. Use standard YAML frontmatter
3. Include responsibilities, patterns, guidelines
4. Update `plugin.json` counts
5. Commit: `feat(agents): add flutter-{domain} agent`

### Adding a Skill

1. Create `skills/flutter-{action}/SKILL.md`
2. Include Usage, Options, Examples, Instructions
3. Reference related agents
4. Update `plugin.json` counts
5. Commit: `feat(skills): add flutter-{action} skill`

## Verification Checklist

Before committing:
- [ ] YAML frontmatter is valid
- [ ] Code blocks have language specifiers
- [ ] Agent references in skills exist
- [ ] plugin.json counts are accurate
- [ ] Examples are practical and correct
