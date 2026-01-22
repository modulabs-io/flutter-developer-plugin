# Gemini Code Review Style Guide

Style guide for GitHub Code Review when reviewing PRs in the flutter-developer-plugin repository.

## Repository Context

This is a Claude Code plugin for Flutter development. It contains documentation files (Markdown), configuration files (JSON), and no executable code.

## File Types and Review Focus

### Agent Files (`agents/flutter-*.md`)

**Review for:**
- Valid YAML frontmatter (name, description, allowed-tools)
- Comprehensive coverage of the agent's domain
- Practical code examples with correct syntax
- Consistent section structure (Responsibilities, Patterns, Guidelines)
- Language specifiers on all code blocks

**Common Issues:**
- Missing or malformed YAML frontmatter
- Code examples without language specifiers
- Incomplete allowed-tools lists
- Outdated Flutter/Dart syntax

### Skill Files (`skills/flutter-*/SKILL.md`)

**Review for:**
- Clear Usage section with syntax
- All Options documented with defaults
- Practical Examples section
- Detailed Instructions for implementation
- Valid Agent Reference to existing agents

**Common Issues:**
- Missing required sections
- Options without default values specified
- References to non-existent agents
- Incomplete instruction steps

### Command Files (`commands/flutter-*.md`)

**Review for:**
- Similar structure to skills
- Clear generated file structure documentation
- Template code that follows conventions

### Configuration Files

**`.claude-plugin/plugin.json`:**
- Accurate agent and skill counts
- Correct category organization
- Valid JSON syntax

**`hooks/hooks.json`:**
- Valid hook event types
- Correct matcher patterns
- Appropriate error handling settings

**`.mcp.json`:**
- Valid MCP server configurations
- Correct permission models

## Commit Message Review

Verify commits follow Conventional Commits:

**Format:** `type(scope): description`

**Valid Types:** feat, fix, docs, refactor, chore

**Valid Scopes:** agents, skills, commands, hooks, mcp, plugin

**Examples of good commits:**
- `feat(agents): add flutter-web-platform agent`
- `fix(skills): correct flutter-build iOS signing steps`
- `docs: update README with installation instructions`

**Flag these issues:**
- Missing type or scope
- Incorrect scope for files changed
- Description not in imperative mood

## Code Example Standards

### Dart Code

```dart
// Good: Uses const, proper formatting
const MyWidget({super.key});

// Bad: Missing const, old syntax
MyWidget({Key? key}) : super(key: key);
```

### YAML Code

```yaml
# Good: Proper indentation
dependencies:
  flutter:
    sdk: flutter
  riverpod: ^2.5.1

# Bad: Inconsistent indentation
dependencies:
flutter:
    sdk: flutter
```

### Bash Commands

```bash
# Good: Clear, complete commands
flutter create --org com.example --platforms ios,android my_app

# Bad: Incomplete or unclear
flutter create my_app
```

## Style Consistency

### Section Headers

Use consistent Markdown heading levels:
- `#` - File title
- `##` - Major sections
- `###` - Subsections
- `####` - Minor subsections (sparingly)

### Code Blocks

Always specify language:
- ` ```dart ` for Dart
- ` ```yaml ` for YAML/pubspec
- ` ```bash ` for shell commands
- ` ```json ` for JSON
- ` ```markdown ` for Markdown examples

### Lists

- Use `-` for unordered lists
- Use `1.` for ordered/numbered steps
- Maintain consistent indentation

## PR Review Checklist

### For Agent Changes

- [ ] YAML frontmatter is valid
- [ ] Name follows `flutter-{domain}` pattern
- [ ] allowed-tools list is appropriate
- [ ] All code examples have language specifiers
- [ ] Code examples use current Flutter/Dart syntax
- [ ] Section structure is consistent with other agents

### For Skill Changes

- [ ] SKILL.md follows standard structure
- [ ] Usage syntax is clear
- [ ] All options have descriptions and defaults
- [ ] Examples are practical and correct
- [ ] Instructions are step-by-step
- [ ] Agent references exist

### For Configuration Changes

- [ ] JSON is valid
- [ ] Counts match actual files
- [ ] Categories are correct
- [ ] No sensitive data exposed

### For All Changes

- [ ] Commit message follows Conventional Commits
- [ ] No typos or grammar issues
- [ ] Links are valid
- [ ] Changes are focused (single concern)
