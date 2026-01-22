# /flutter-ai-rules

Generate AI assistant rules files tailored to your Flutter project and editor.

## Usage

```
/flutter-ai-rules [command] [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate rules file for specified editor (default) |
| `detect` | Analyze project and show detected configuration |
| `update` | Update existing rules file with current project config |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--editor <name>` | Target editor: `claude`, `cursor`, `copilot`, `windsurf`, `vscode` | auto-detect |
| `--output <path>` | Custom output path | editor default |
| `--include-deps` | Include dependency-specific rules | `true` |
| `--minimal` | Generate minimal rules (smaller context) | `false` |

## Examples

```bash
# Generate rules for Claude Code
/flutter-ai-rules generate --editor claude

# Auto-detect editor and generate
/flutter-ai-rules generate

# Detect project configuration only
/flutter-ai-rules detect

# Generate minimal rules for Cursor
/flutter-ai-rules generate --editor cursor --minimal

# Update existing rules file
/flutter-ai-rules update
```

## Supported Editors

| Editor | Output File | Notes |
|--------|-------------|-------|
| Claude Code | `CLAUDE.md` | Project root |
| Cursor | `.cursor/rules` or `AGENTS.md` | Creates .cursor dir if needed |
| GitHub Copilot | `.github/copilot-instructions.md` | Creates .github dir if needed |
| Windsurf | `.windsurfrules` | Project root |
| VS Code | `.vscode/settings.json` | Merges with existing |

## What Gets Detected

The skill analyzes your Flutter project to detect:

### From pubspec.yaml
- **State Management**: Riverpod, Bloc, Provider, GetX
- **Routing**: go_router, auto_route, beamer
- **Networking**: dio, http, chopper
- **Database**: drift, hive, isar, sqflite
- **Code Generation**: freezed, json_serializable, build_runner
- **Testing**: mocktail, mockito, bloc_test

### From Project Structure
- **Architecture**: Feature-first vs Layer-first
- **Platforms**: iOS, Android, macOS, Windows, Linux, Web
- **Firebase**: Detected via firebase_core dependency
- **Supabase**: Detected via supabase_flutter dependency

### From analysis_options.yaml
- Lint rules and strictness level
- Custom analysis configuration

## Generated Rules Content

### For Claude Code (CLAUDE.md)

```markdown
# Flutter Project: {project_name}

## Project Configuration
- **State Management**: Riverpod
- **Architecture**: Feature-first
- **Platforms**: iOS, Android, macOS

## Code Guidelines

### State Management (Riverpod)
- Use `ref.watch()` in build methods
- Use `ref.read()` in callbacks and event handlers
- Prefer `AsyncNotifierProvider` for async operations
- Use `@riverpod` annotation with riverpod_generator

### Architecture
- Follow feature-first folder structure
- Each feature has data/, domain/, presentation/ layers
- Domain layer has no Flutter imports
- Use Either<Failure, T> for error handling

### Widget Guidelines
- Always use const constructors where possible
- Prefer StatelessWidget over StatefulWidget
- Keep widgets small and focused (<100 lines)
- Use named parameters for clarity

### Testing
- Write unit tests for all use cases
- Use widget tests for UI components
- Mock dependencies with Mocktail
- Target 80%+ code coverage

### Code Generation
- Run `dart run build_runner build` after model changes
- Use Freezed for immutable data classes
- Generated files: *.g.dart, *.freezed.dart

## Project-Specific Patterns
[Detected patterns based on existing code]
```

### For Cursor (.cursor/rules)

```
You are a Flutter expert working on {project_name}.

Tech Stack:
- Flutter {version}
- State: {state_management}
- Architecture: {architecture}

Rules:
1. Use const constructors
2. Prefer {state_management} patterns
3. Follow {architecture} structure
4. Write tests with Mocktail
5. Use Freezed for data classes

File Structure:
lib/
├── core/
├── features/
│   └── {feature}/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
```

## Flutter Official AI Rules

This skill incorporates Flutter's official AI guidelines from:
- https://docs.flutter.dev/ai/ai-rules
- https://docs.flutter.dev/ai/best-practices

### Key Principles from Official Rules

1. **Widget Composition**
   - Prefer composition over inheritance
   - Extract widgets into separate classes for reusability
   - Use const where possible for performance

2. **State Management**
   - Keep state close to where it's used
   - Avoid global state when possible
   - Use appropriate granularity for rebuilds

3. **Performance**
   - Use const constructors
   - Avoid expensive operations in build()
   - Use ListView.builder for long lists

4. **Error Handling**
   - Handle all async errors
   - Provide meaningful error messages
   - Use proper loading/error states in UI

5. **Testing**
   - Unit test business logic
   - Widget test UI components
   - Integration test critical flows

## Workflow

### Initial Setup

```bash
# 1. Detect your project configuration
/flutter-ai-rules detect

# 2. Generate rules for your editor
/flutter-ai-rules generate --editor claude

# 3. Review and customize the generated file
# 4. Commit to version control
```

### Keeping Rules Updated

```bash
# After adding new dependencies or changing architecture
/flutter-ai-rules update
```

## Customization

After generation, customize the rules file to add:

- Team-specific conventions
- Project-specific patterns
- Custom lint rules
- Architectural decisions
- API/backend specifics

### Example Customizations

```markdown
## Custom Conventions

### Naming
- Use `_WidgetName` suffix for private widgets
- Use `WidgetNameController` for widget-specific logic
- Use `WidgetNameState` for widget state classes

### API
- All API calls go through ApiClient
- Use interceptors for auth tokens
- Retry failed requests 3 times

### Colors & Theme
- Use `AppColors.primary` not `Colors.blue`
- Use `AppSpacing.md` for consistent spacing
- All text uses `AppTypography` styles
```

## Integration with Other Skills

This skill works well with:

- `/flutter-create` - Generate rules after project creation
- `/flutter-migrate` - Update rules after architecture changes
- `/flutter-analyze` - Rules reference analysis configuration

## Best Practices

1. **Commit rules files** - Version control your AI rules
2. **Keep rules focused** - Don't overload with too many rules
3. **Update regularly** - Refresh rules when project evolves
4. **Team alignment** - Ensure all team members use same rules
5. **Test the output** - Verify AI follows the rules correctly

## Character Limits

Some editors have context limits. Use `--minimal` for constrained contexts:

| Editor | Typical Limit | Recommendation |
|--------|--------------|----------------|
| Claude Code | Large | Full rules |
| Cursor | ~10K chars | Full or minimal |
| Copilot | ~4K chars | Minimal |
| Windsurf | Varies | Full rules |

## Related

- `flutter-architect` agent - Architecture decisions
- [Flutter AI Docs](https://docs.flutter.dev/ai) - Official guidelines
- [Flutter Rules on GitHub](https://github.com/flutter/flutter/tree/main/docs/rules)
