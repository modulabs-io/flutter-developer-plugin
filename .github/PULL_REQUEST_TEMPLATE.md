## Description

<!-- Briefly describe the changes in this PR -->

## Type of Change

<!-- Check all that apply -->

- [ ] `feat` - New agent, skill, or command
- [ ] `fix` - Bug fix in existing content
- [ ] `docs` - Documentation changes
- [ ] `refactor` - Restructure without behavior change
- [ ] `chore` - Maintenance (configs, dependencies)

## Scope

<!-- Check the areas affected -->

- [ ] `agents` - Changes to agents/
- [ ] `skills` - Changes to skills/
- [ ] `commands` - Changes to commands/
- [ ] `hooks` - Changes to hooks/
- [ ] `mcp` - Changes to .mcp.json
- [ ] `plugin` - Changes to .claude-plugin/
- [ ] Other: _________

## Checklist

### Content Quality

- [ ] YAML frontmatter is valid (for agent/skill files)
- [ ] All code blocks have language specifiers (```dart, ```yaml, etc.)
- [ ] Code examples follow Flutter/Dart best practices
- [ ] Examples are practical and copy-pasteable

### Consistency

- [ ] File naming follows conventions (`flutter-{domain}.md`, `flutter-{action}/SKILL.md`)
- [ ] Section structure matches existing files of same type
- [ ] Agent references in skills point to existing agents

### Counts and Manifest

- [ ] Updated `.claude-plugin/plugin.json` counts (if adding files)
- [ ] Updated categories in plugin.json (if applicable)

### Testing

- [ ] Tested with Claude Code (if applicable)
- [ ] Verified bash commands execute correctly
- [ ] Validated YAML syntax

### Commits

- [ ] Commit messages follow Conventional Commits format
- [ ] Commits are focused (single concern per commit)

## Additional Notes

<!-- Any additional context or notes for reviewers -->
