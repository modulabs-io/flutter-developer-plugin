# /flutter-test

Run tests with coverage analysis, identify failures, and suggest fixes.

## Usage

```
/flutter-test [options] [test_path]
```

## Options

- `--coverage`: Generate code coverage report
- `--coverage-html`: Generate HTML coverage report (requires lcov)
- `--watch`: Re-run tests on file changes
- `--update-goldens`: Update golden image files
- `--tags <tags>`: Run tests with specific tags
- `--exclude-tags <tags>`: Exclude tests with specific tags
- `--concurrency <n>`: Number of concurrent test processes
- `--reporter <type>`: Output format (compact|expanded|json)
- `--fail-fast`: Stop on first failure
- `--integration`: Run integration tests
- `--unit`: Run only unit tests
- `--widget`: Run only widget tests

## Examples

```
/flutter-test
/flutter-test --coverage
/flutter-test test/features/auth/
/flutter-test --coverage --coverage-html
/flutter-test --watch
/flutter-test --integration
/flutter-test --tags "smoke"
```

## Instructions

When the user invokes `/flutter-test`, follow these steps:

### 1. Verify Test Environment

```bash
# Check Flutter installation
flutter --version

# Ensure dependencies are available
flutter pub get
```

### 2. Identify Test Types

Scan the test directory structure:

```
test/
├── unit/           # Pure Dart logic tests
├── widget/         # Widget tests with WidgetTester
├── integration/    # Full app integration tests
└── golden/         # Visual regression tests
```

Or flat structure:
```
test/
├── *_test.dart           # Unit tests
├── *_widget_test.dart    # Widget tests
└── integration_test/     # Integration tests
```

### 3. Run Tests

#### Basic Test Run
```bash
flutter test
```

#### With Coverage
```bash
flutter test --coverage
```

#### Specific Test File/Directory
```bash
flutter test {{test_path}}
```

#### Integration Tests
```bash
flutter test integration_test/
# Or with specific device
flutter test integration_test/app_test.dart -d {{device_id}}
```

#### With Tags
```bash
flutter test --tags "unit"
flutter test --exclude-tags "slow,integration"
```

### 4. Parse Test Results

Categorize results:

```yaml
test_results:
  passed: []
  failed:
    - file: test/auth_test.dart
      test_name: "should authenticate user with valid credentials"
      error: "Expected: true, Actual: false"
      line: 42
  skipped: []

summary:
  total: 150
  passed: 145
  failed: 3
  skipped: 2
  duration: "45.2s"
```

### 5. Generate Coverage Report

```bash
# Generate lcov report
flutter test --coverage

# View coverage summary
lcov --summary coverage/lcov.info

# Generate HTML report (requires lcov)
genhtml coverage/lcov.info -o coverage/html

# Open report
open coverage/html/index.html  # macOS
xdg-open coverage/html/index.html  # Linux
start coverage/html/index.html  # Windows
```

### 6. Analyze Coverage

Report coverage by:
- Total project coverage
- Coverage by feature/module
- Files with low coverage
- Uncovered lines

```
Coverage Report
===============

Total Coverage: 82.5%

By Feature:
- auth:     95.2%
- home:     88.4%
- settings: 72.1%
- profile:  65.8%

Low Coverage Files:
1. lib/features/profile/profile_service.dart (45.2%)
2. lib/core/utils/date_utils.dart (52.1%)
3. lib/features/settings/settings_bloc.dart (58.9%)

Uncovered Critical Paths:
- Error handling in AuthRepository.signIn()
- Edge cases in DateUtils.parseDate()
```

### 7. Analyze Failures

For each failure, provide:

```yaml
failure_analysis:
  test: "AuthBloc should emit authenticated state on successful login"
  location: "test/features/auth/bloc/auth_bloc_test.dart:42"
  error_type: "StateError"
  message: "Expected: AuthState.authenticated, Actual: AuthState.loading"

  probable_causes:
    - "Async operation not properly awaited"
    - "Missing state emission in bloc"
    - "Mock not configured correctly"

  suggested_fix: |
    // Ensure you're waiting for state changes:
    await expectLater(
      bloc.stream,
      emitsInOrder([
        AuthState.loading(),
        AuthState.authenticated(user: mockUser),
      ]),
    );

  related_files:
    - lib/features/auth/bloc/auth_bloc.dart
    - lib/features/auth/data/auth_repository.dart
```

### 8. Test Patterns Reference

#### Unit Test Template
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late AuthService sut;
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    sut = AuthService(repository: mockRepository);
  });

  group('AuthService', () {
    test('should return user on successful login', () async {
      // Arrange
      when(() => mockRepository.signIn(any(), any()))
          .thenAnswer((_) async => mockUser);

      // Act
      final result = await sut.signIn('email', 'password');

      // Assert
      expect(result, equals(mockUser));
      verify(() => mockRepository.signIn('email', 'password')).called(1);
    });
  });
}
```

#### Widget Test Template
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  group('LoginPage', () {
    testWidgets('should show error on invalid email', (tester) async {
      // Arrange
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      // Act
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'invalid-email',
      );
      await tester.tap(find.byKey(const Key('submit_button')));
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Invalid email format'), findsOneWidget);
    });
  });
}
```

#### Integration Test Template
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('complete login flow', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find and tap login button
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'test@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );

      // Submit
      await tester.tap(find.byKey(const Key('submit_button')));
      await tester.pumpAndSettle();

      // Verify navigation to home
      expect(find.text('Welcome'), findsOneWidget);
    });
  });
}
```

### 9. Golden Tests

For visual regression testing:

```bash
# Update golden files
flutter test --update-goldens

# Run golden tests
flutter test test/golden/
```

```dart
testWidgets('matches golden file', (tester) async {
  await tester.pumpWidget(
    const MaterialApp(home: MyWidget()),
  );

  await expectLater(
    find.byType(MyWidget),
    matchesGoldenFile('goldens/my_widget.png'),
  );
});
```

### 10. Watch Mode

For development workflow:

```bash
# Using very_good_cli
very_good test --watch

# Using custom script
flutter pub run build_runner watch & flutter test --watch
```

### 11. Output Summary

```
Test Results
============

Total: 150 tests in 25 files
Passed: 145 (96.7%)
Failed: 3
Skipped: 2

Duration: 45.2s

Coverage: 82.5%
Coverage target: 80% ✓

Failed Tests:
1. AuthBloc should emit authenticated state (auth_bloc_test.dart:42)
2. DateUtils should parse ISO format (date_utils_test.dart:28)
3. ProfileWidget should show avatar (profile_widget_test.dart:55)

Run `/flutter-test --coverage-html` for detailed coverage report.
```

## Agent Reference

For testing strategies and patterns, consult the `flutter-test-engineer` agent.
