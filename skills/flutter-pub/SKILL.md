# /flutter-pub

Manage Flutter/Dart dependencies: add, remove, upgrade, and analyze packages.

## Usage

```
/flutter-pub <command> [options] [packages...]
```

## Commands

- `get`: Install dependencies from pubspec.yaml
- `add`: Add dependency to pubspec.yaml
- `remove`: Remove dependency from pubspec.yaml
- `upgrade`: Upgrade dependencies
- `outdated`: Show outdated packages
- `deps`: Show dependency tree
- `cache`: Manage pub cache
- `publish`: Publish package to pub.dev

## Options

### For `add`
- `--dev`: Add as dev dependency
- `--path <path>`: Add path dependency
- `--git <url>`: Add git dependency
- `--git-ref <ref>`: Git reference (branch, tag, commit)

### For `upgrade`
- `--major-versions`: Upgrade to latest major versions
- `--dry-run`: Show what would be upgraded
- `--null-safety`: Check null safety compatibility

### For `outdated`
- `--json`: Output as JSON
- `--dependency-overrides`: Show overrides

## Examples

```
/flutter-pub get
/flutter-pub add dio
/flutter-pub add --dev mocktail
/flutter-pub add --path ../my_package
/flutter-pub add --git https://github.com/user/repo.git --git-ref main
/flutter-pub remove http
/flutter-pub upgrade
/flutter-pub upgrade --major-versions
/flutter-pub outdated
/flutter-pub deps
/flutter-pub cache clean
```

## Instructions

When the user invokes `/flutter-pub`, follow these steps:

### 1. Verify pubspec.yaml Exists

```bash
test -f pubspec.yaml && echo "Found pubspec.yaml" || echo "Not a Dart/Flutter project"
```

### 2. Execute Pub Commands

#### Get Dependencies

```bash
# Standard get
flutter pub get

# Offline mode (use cached packages)
flutter pub get --offline

# Enforce package resolution
flutter pub get --enforce-lockfile
```

#### Add Dependencies

```bash
# Add regular dependency
flutter pub add {{package}}

# Add specific version
flutter pub add {{package}}:^2.0.0

# Add dev dependency
flutter pub add --dev {{package}}

# Add multiple packages
flutter pub add dio logger equatable

# Add path dependency
flutter pub add {{package}} --path ../{{package}}

# Add git dependency
flutter pub add {{package}} --git-url https://github.com/user/repo.git

# Add git dependency with ref
flutter pub add {{package}} --git-url https://github.com/user/repo.git --git-ref v2.0.0
```

#### Remove Dependencies

```bash
# Remove dependency
flutter pub remove {{package}}

# Remove multiple
flutter pub remove http dio
```

#### Upgrade Dependencies

```bash
# Upgrade within version constraints
flutter pub upgrade

# Upgrade specific package
flutter pub upgrade {{package}}

# Upgrade to latest major versions (updates pubspec.yaml)
flutter pub upgrade --major-versions

# Dry run
flutter pub upgrade --dry-run
```

#### Check Outdated Packages

```bash
# Show outdated packages
flutter pub outdated

# JSON output for parsing
flutter pub outdated --json

# Include dev dependencies
flutter pub outdated --dev-dependencies
```

#### View Dependency Tree

```bash
# Full dependency tree
flutter pub deps

# Specific format
flutter pub deps --style=tree
flutter pub deps --style=compact
flutter pub deps --style=list
```

#### Manage Cache

```bash
# Clean entire cache
flutter pub cache clean

# Repair cache
flutter pub cache repair

# Add package to cache
flutter pub cache add {{package}}
```

### 3. Parse and Analyze Results

For `outdated` command, parse output:

```yaml
outdated_report:
  packages:
    - name: dio
      current: 4.0.0
      upgradable: 4.0.6
      resolvable: 5.4.0
      latest: 5.4.0
      status: outdated_major

    - name: provider
      current: 6.0.0
      upgradable: 6.1.1
      resolvable: 6.1.1
      latest: 6.1.1
      status: outdated_minor

  summary:
    up_to_date: 45
    outdated_minor: 8
    outdated_major: 3
    deprecated: 1
```

### 4. Dependency Recommendations

When adding packages, provide recommendations:

#### State Management
```yaml
riverpod:
  packages:
    - flutter_riverpod: ^2.5.1
    - riverpod_annotation: ^2.3.5
  dev_packages:
    - riverpod_generator: ^2.4.0
    - build_runner: ^2.4.9

bloc:
  packages:
    - flutter_bloc: ^8.1.5
    - bloc: ^8.1.4
    - equatable: ^2.0.5
  dev_packages:
    - bloc_test: ^9.1.7
```

#### Networking
```yaml
dio:
  packages:
    - dio: ^5.4.2+1
    - pretty_dio_logger: ^1.3.1
  alternatives:
    - http: ^1.2.0 (simpler, standard library)
    - retrofit: ^4.1.0 (type-safe with code generation)
```

#### Local Storage
```yaml
shared_preferences:
  package: shared_preferences: ^2.2.2
  use_case: "Simple key-value storage"

hive:
  packages:
    - hive: ^2.2.3
    - hive_flutter: ^1.1.0
  dev_packages:
    - hive_generator: ^2.0.1
  use_case: "Fast NoSQL local database"

drift:
  packages:
    - drift: ^2.16.0
    - drift_flutter: ^0.1.0
  dev_packages:
    - drift_dev: ^2.16.0
  use_case: "Type-safe SQL database"
```

#### Code Generation
```yaml
freezed:
  packages:
    - freezed_annotation: ^2.4.1
  dev_packages:
    - freezed: ^2.4.7
    - build_runner: ^2.4.9
    - json_serializable: ^6.7.1

json_serializable:
  packages:
    - json_annotation: ^4.8.1
  dev_packages:
    - json_serializable: ^6.7.1
    - build_runner: ^2.4.9
```

### 5. Version Constraint Guidelines

Explain version constraints:

```yaml
constraints:
  any: "any"           # Any version (not recommended)
  exact: "2.0.0"       # Exact version (not recommended)
  caret: "^2.0.0"      # >=2.0.0 <3.0.0 (recommended)
  range: ">=2.0.0 <3.0.0"  # Explicit range
  git:
    git:
      url: https://github.com/user/repo.git
      ref: main
  path:
    path: ../local_package
```

### 6. Handle Dependency Conflicts

When conflicts occur:

```bash
# Check for conflicts
flutter pub get

# If conflict, analyze:
flutter pub deps

# Resolution strategies:
# 1. Use dependency_overrides (temporary)
# 2. Upgrade conflicting packages
# 3. Use compatible version ranges
```

Example `pubspec.yaml` override:
```yaml
dependency_overrides:
  collection: ^1.18.0  # Force specific version
```

### 7. Security Checks

Check for known vulnerabilities:

```bash
# Using dart pub outdated for security
flutter pub outdated --json | grep -i "security\|vulnerability\|deprecated"
```

Flag packages that are:
- Deprecated
- Discontinued
- Have known security issues
- Haven't been updated in >2 years

### 8. Pre-Publish Checks

For package publishing:

```bash
# Dry run publish
flutter pub publish --dry-run

# Validate package
dart pub publish --dry-run

# Check score potential
# Visit: https://pub.dev/packages/{{package}}/score
```

Required for publishing:
- `pubspec.yaml` with required fields (name, version, description)
- `LICENSE` file
- `CHANGELOG.md`
- `README.md`
- Pass `flutter analyze`
- No sensitive data

### 9. Output Summary

```
Dependency Update Summary
=========================

Action: upgrade

Updated packages:
- dio: 4.0.0 → 5.4.2+1
- provider: 6.0.0 → 6.1.1
- logger: 2.0.1 → 2.2.0

Unchanged (up to date): 42 packages

Major version updates available:
- go_router: 12.0.0 → 14.0.0 (breaking changes likely)
- flutter_bloc: 7.2.0 → 8.1.5 (migration guide available)

Run `/flutter-pub upgrade --major-versions` to update major versions.

Security notices:
- http 0.13.0: Deprecated, use http ^1.0.0

Recommended actions:
1. Review go_router migration guide before upgrading
2. Replace deprecated http package
3. Run tests after upgrade: /flutter-test
```

## Agent Reference

For architecture and dependency decisions, consult the `flutter-architect` agent.
