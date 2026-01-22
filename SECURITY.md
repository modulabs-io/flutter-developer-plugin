# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/modulabs-io/flutter-developer-plugin/security/advisories/new) to report the issue directly.

2. **Email**: Send details to the maintainers (check CODEOWNERS for contact information).

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., code injection, information disclosure)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (file, line number if possible)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue and how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours of your report
- **Status Update**: Within 7 days with our assessment
- **Resolution**: We aim to resolve critical issues within 30 days

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will investigate and validate the reported issue
3. We will work on a fix and coordinate disclosure timing with you
4. We will credit you in the security advisory (unless you prefer anonymity)

## Security Considerations for This Plugin

This plugin provides Claude Code agents, skills, and commands for Flutter development. While the plugin itself doesn't execute code directly, users should be aware:

- **Agent instructions**: Agents may suggest running shell commands. Always review commands before execution.
- **MCP configurations**: The `.mcp.json` file configures external tool integrations. Review these configurations for your environment.
- **Generated code**: Code suggestions should be reviewed before use in production applications.

## Scope

This security policy applies to:

- All files in the `flutter-developer-plugin` repository
- Official releases and tags
- Documentation and configuration files

Thank you for helping keep this project secure!
