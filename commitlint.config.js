/**
 * Commitlint configuration for flutter-developer-plugin
 * Enforces Conventional Commits format with plugin-specific scopes
 *
 * Format: type(scope): description
 *
 * Install:
 *   npm install --save-dev @commitlint/cli @commitlint/config-conventional
 *
 * Usage with Husky:
 *   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce specific types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New agent, skill, or command
        'fix',      // Bug fix in existing content
        'docs',     // Documentation changes (README, CONTRIBUTING)
        'refactor', // Restructure without behavior change
        'chore',    // Maintenance (configs, dependencies)
        'style',    // Formatting, whitespace changes
        'test',     // Adding or updating tests
        'ci',       // CI/CD configuration changes
        'perf',     // Performance improvements
        'revert',   // Reverting previous commits
      ],
    ],

    // Enforce specific scopes for this plugin
    'scope-enum': [
      2,
      'always',
      [
        'agents',   // Changes to agents/
        'skills',   // Changes to skills/
        'commands', // Changes to commands/
        'hooks',    // Changes to hooks/
        'mcp',      // Changes to .mcp.json
        'plugin',   // Changes to .claude-plugin/
        'deps',     // Dependency updates
        'release',  // Release-related changes
      ],
    ],

    // Scope is optional but encouraged
    'scope-empty': [1, 'never'],

    // Subject formatting
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Type formatting
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Body and footer
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
