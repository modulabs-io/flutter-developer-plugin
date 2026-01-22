# /flutter-codegen

Manage code generation workflows with build_runner, Freezed, json_serializable, and more.

## Usage

```
/flutter-codegen [command] [options]
```

## Commands

- `build`: Run build_runner once
- `watch`: Run build_runner in watch mode
- `clean`: Clean generated files and rebuild
- `freezed`: Generate Freezed model from template
- `json`: Generate JSON serializable model
- `conflicts`: Resolve build_runner conflicts

## Options

- `--delete-conflicting-outputs`: Delete conflicting files before building
- `--verbose`: Show detailed build output
- `--filter <pattern>`: Only build matching packages
- `--release`: Build with release mode optimizations

## Examples

```
/flutter-codegen build
/flutter-codegen watch
/flutter-codegen clean
/flutter-codegen build --delete-conflicting-outputs
/flutter-codegen freezed User
/flutter-codegen json ApiResponse
```

## Instructions

When the user invokes `/flutter-codegen`, follow these steps:

### 1. Verify Setup

Check that code generation dependencies are installed:

```yaml
# Required in pubspec.yaml
dev_dependencies:
  build_runner: ^2.4.9
  # Optional based on usage:
  freezed: ^2.4.7
  json_serializable: ^6.7.1
  riverpod_generator: ^2.4.0
  retrofit_generator: ^8.1.0
  auto_route_generator: ^8.0.0
  hive_generator: ^2.0.1
  drift_dev: ^2.16.0
```

### 2. Execute Commands

#### Build (One-time)

```bash
# Standard build
dart run build_runner build

# Delete conflicting outputs (recommended)
dart run build_runner build --delete-conflicting-outputs

# Verbose output
dart run build_runner build --verbose

# Filter to specific package
dart run build_runner build --build-filter="package:my_app/*"
```

#### Watch Mode

```bash
# Watch for changes
dart run build_runner watch

# Watch with delete conflicting
dart run build_runner watch --delete-conflicting-outputs
```

#### Clean Build

```bash
# Clean and rebuild
dart run build_runner clean
dart run build_runner build --delete-conflicting-outputs
```

### 3. Configure build.yaml

For optimized builds, create/update `build.yaml`:

```yaml
targets:
  $default:
    builders:
      # Freezed configuration
      freezed|freezed:
        generate_for:
          include:
            - lib/features/**/domain/entities/*.dart
            - lib/features/**/data/models/*.dart
        options:
          # Customize Freezed behavior
          format: true

      # JSON serializable configuration
      json_serializable|json_serializable:
        generate_for:
          include:
            - lib/features/**/data/models/*.dart
        options:
          # Use explicit JSON keys
          explicit_to_json: true
          # Handle missing keys
          include_if_null: false
          # Field rename strategy
          field_rename: snake

      # Riverpod generator
      riverpod_generator|riverpod_generator:
        generate_for:
          include:
            - lib/features/**/presentation/providers/*.dart
            - lib/core/providers/*.dart

      # Auto route generator
      auto_route_generator|auto_route_generator:
        generate_for:
          include:
            - lib/router.dart

global_options:
  # Apply to all builders
  source_gen|combining_builder:
    options:
      ignore_for_file:
        - type=lint
```

### 4. Generate Freezed Models

Template for Freezed model:

```dart
// lib/features/auth/domain/entities/user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    String? avatarUrl,
    @Default(false) bool isVerified,
    DateTime? createdAt,
  }) = _User;

  /// Custom methods require a private constructor
  const User._();

  /// Custom getter
  bool get hasAvatar => avatarUrl != null;

  /// From JSON
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

#### Union Types with Freezed

```dart
// lib/core/errors/result.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'result.freezed.dart';

@freezed
sealed class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String message, [StackTrace? stackTrace]) = Failure<T>;
  const factory Result.loading() = Loading<T>;
}

// Usage with pattern matching
final result = await repository.fetchData();
result.when(
  success: (data) => print('Data: $data'),
  failure: (message, _) => print('Error: $message'),
  loading: () => print('Loading...'),
);
```

### 5. Generate JSON Serializable Models

```dart
// lib/features/auth/data/models/user_model.dart
import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/user.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  @JsonKey(name: 'id')
  final String id;

  @JsonKey(name: 'email')
  final String email;

  @JsonKey(name: 'display_name')
  final String name;

  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;

  @JsonKey(name: 'is_verified', defaultValue: false)
  final bool isVerified;

  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.avatarUrl,
    this.isVerified = false,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  /// Convert to domain entity
  User toEntity() => User(
        id: id,
        email: email,
        name: name,
        avatarUrl: avatarUrl,
        isVerified: isVerified,
        createdAt: createdAt,
      );

  /// Create from domain entity
  factory UserModel.fromEntity(User user) => UserModel(
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      );
}
```

### 6. Riverpod Code Generation

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_provider.g.dart';

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<User?> build() async {
    return ref.watch(authRepositoryProvider).getCurrentUser();
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      return repository.signIn(email, password);
    });
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}

// Read-only provider
@riverpod
Future<List<Product>> products(ProductsRef ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getAll();
}

// Keep alive provider (not auto-disposed)
@Riverpod(keepAlive: true)
class AppSettings extends _$AppSettings {
  @override
  Settings build() => Settings.defaults();

  void updateTheme(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }
}
```

### 7. Retrofit API Client Generation

```dart
// lib/core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'api_client.g.dart';

@RestApi(baseUrl: 'https://api.example.com/v1')
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  @GET('/users')
  Future<List<UserModel>> getUsers();

  @GET('/users/{id}')
  Future<UserModel> getUser(@Path('id') String id);

  @POST('/users')
  Future<UserModel> createUser(@Body() CreateUserRequest request);

  @PUT('/users/{id}')
  Future<UserModel> updateUser(
    @Path('id') String id,
    @Body() UpdateUserRequest request,
  );

  @DELETE('/users/{id}')
  Future<void> deleteUser(@Path('id') String id);

  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);

  @Multipart()
  @POST('/upload')
  Future<UploadResponse> uploadFile(@Part() File file);
}
```

### 8. Resolve Conflicts

When build_runner reports conflicts:

```bash
# Error: Conflicting outputs
# Run with --delete-conflicting-outputs to fix

dart run build_runner build --delete-conflicting-outputs
```

Common conflict causes:
- Renamed files with existing generated code
- Changed part file names
- Multiple generators targeting same output

### 9. Performance Tips

For large projects:

```yaml
# build.yaml - Optimize build times
targets:
  $default:
    builders:
      json_serializable|json_serializable:
        generate_for:
          include:
            - lib/**/models/*.dart
          exclude:
            - lib/**/generated/**
            - test/**

# Limit concurrent builds
global_options:
  build_runner:
    options:
      # Reduce memory usage
      max_workers: 4
```

### 10. Output Summary

```
Code Generation Complete
========================

Command: build
Duration: 12.3s

Generated Files:
- 45 .g.dart files (JSON serialization)
- 23 .freezed.dart files (Freezed models)
- 12 .gr.dart files (Riverpod providers)

Warnings:
- user_model.dart: Missing @JsonKey for field 'metadata'

Tips:
- Run `flutter-codegen watch` during development
- Use build.yaml filters to speed up rebuilds
- Add *.g.dart and *.freezed.dart to .gitignore if not committing generated code
```

## Agent Reference

For code generation patterns, consult the `flutter-codegen-assistant` agent.
