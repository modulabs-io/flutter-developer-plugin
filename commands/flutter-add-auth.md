---
name: flutter-add-auth
description: Add complete authentication feature with login, register, and forgot password flows
arguments:
  - name: backend
    description: Authentication backend provider
    required: true
    type: choice
    options: [firebase, supabase, custom]
  - name: methods
    description: Comma-separated authentication methods to support
    type: string
    default: email
    examples: ["email", "email,google", "email,google,apple,phone"]
  - name: feature-name
    description: Name for the auth feature directory
    type: string
    default: auth
  - name: state
    description: State management solution
    type: choice
    options: [riverpod, bloc, provider]
    default: riverpod
  - name: guards
    description: Include route guards/middleware
    type: boolean
    default: true
  - name: biometrics
    description: Include biometric authentication support
    type: boolean
    default: false
agents:
  - flutter-firebase-auth
  - flutter-supabase-auth
  - flutter-state-manager
  - flutter-architect
---

# Flutter Add Auth Command

Add a complete authentication feature with login, register, forgot password flows, auth state management, and route guards.

## Usage

```
/flutter-add-auth <backend> [options]
```

## Options

- `--methods <list>`: Authentication methods (email, google, apple, phone)
- `--feature-name <name>`: Custom feature directory name (default: auth)
- `--state <manager>`: State management (riverpod, bloc, provider)
- `--guards`: Include route guards (default: true)
- `--biometrics`: Include biometric authentication

## Examples

```
/flutter-add-auth firebase --methods email,google
/flutter-add-auth supabase --methods email,google,apple --state bloc
/flutter-add-auth custom --methods email --feature-name authentication
/flutter-add-auth firebase --methods email,google,apple,phone --biometrics
```

## Generated Structure

```
lib/features/{{auth}}/
├── data/
│   ├── datasources/
│   │   ├── auth_local_datasource.dart
│   │   └── auth_remote_datasource.dart
│   ├── models/
│   │   └── user_model.dart
│   └── repositories/
│       └── auth_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── user.dart
│   ├── repositories/
│   │   └── auth_repository.dart
│   └── usecases/
│       ├── sign_in_with_email.dart
│       ├── sign_in_with_google.dart
│       ├── sign_in_with_apple.dart
│       ├── sign_up_with_email.dart
│       ├── sign_out.dart
│       ├── reset_password.dart
│       └── get_current_user.dart
└── presentation/
    ├── pages/
    │   ├── login_page.dart
    │   ├── register_page.dart
    │   ├── forgot_password_page.dart
    │   └── profile_page.dart
    ├── providers/  (or bloc/)
    │   └── auth_provider.dart
    ├── widgets/
    │   ├── auth_button.dart
    │   ├── social_login_buttons.dart
    │   └── auth_text_field.dart
    └── guards/
        └── auth_guard.dart
```

## Template Files

### User Entity

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
    String? displayName,
    String? photoUrl,
    String? phoneNumber,
    @Default(false) bool emailVerified,
    DateTime? createdAt,
    DateTime? lastSignInAt,
  }) = _User;

  const User._();

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

### Auth Repository Interface

```dart
// lib/features/auth/domain/repositories/auth_repository.dart
import '../entities/user.dart';

abstract class AuthRepository {
  Stream<User?> get authStateChanges;
  Future<User?> get currentUser;

  Future<User> signInWithEmail(String email, String password);
  Future<User> signUpWithEmail(String email, String password, {String? displayName});
  Future<User> signInWithGoogle();
  Future<User> signInWithApple();
  Future<void> signInWithPhone(String phoneNumber, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onError,
  });
  Future<User> verifyPhoneCode(String verificationId, String code);
  Future<void> sendPasswordResetEmail(String email);
  Future<void> signOut();
  Future<void> deleteAccount();
}
```

### Firebase Auth Repository Implementation

```dart
// lib/features/auth/data/repositories/auth_repository_impl.dart (Firebase)
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

class FirebaseAuthRepository implements AuthRepository {
  final firebase.FirebaseAuth _auth;
  final GoogleSignIn _googleSignIn;

  FirebaseAuthRepository({
    firebase.FirebaseAuth? auth,
    GoogleSignIn? googleSignIn,
  })  : _auth = auth ?? firebase.FirebaseAuth.instance,
        _googleSignIn = googleSignIn ?? GoogleSignIn();

  @override
  Stream<User?> get authStateChanges {
    return _auth.authStateChanges().map(_mapFirebaseUser);
  }

  @override
  Future<User?> get currentUser async {
    return _mapFirebaseUser(_auth.currentUser);
  }

  User? _mapFirebaseUser(firebase.User? firebaseUser) {
    if (firebaseUser == null) return null;
    return User(
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName,
      photoUrl: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      emailVerified: firebaseUser.emailVerified,
    );
  }

  @override
  Future<User> signInWithEmail(String email, String password) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return _mapFirebaseUser(credential.user)!;
  }

  @override
  Future<User> signUpWithEmail(String email, String password, {String? displayName}) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (displayName != null) {
      await credential.user?.updateDisplayName(displayName);
    }
    return _mapFirebaseUser(credential.user)!;
  }

  @override
  Future<User> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) throw Exception('Google sign in cancelled');

    final googleAuth = await googleUser.authentication;
    final credential = firebase.GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final result = await _auth.signInWithCredential(credential);
    return _mapFirebaseUser(result.user)!;
  }

  @override
  Future<User> signInWithApple() async {
    final appleCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );

    final credential = firebase.OAuthProvider('apple.com').credential(
      idToken: appleCredential.identityToken,
      accessToken: appleCredential.authorizationCode,
    );

    final result = await _auth.signInWithCredential(credential);
    return _mapFirebaseUser(result.user)!;
  }

  @override
  Future<void> signInWithPhone(
    String phoneNumber, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onError,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (credential) async {
        await _auth.signInWithCredential(credential);
      },
      verificationFailed: (e) => onError(e.message ?? 'Verification failed'),
      codeSent: (verificationId, _) => onCodeSent(verificationId),
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  @override
  Future<User> verifyPhoneCode(String verificationId, String code) async {
    final credential = firebase.PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: code,
    );
    final result = await _auth.signInWithCredential(credential);
    return _mapFirebaseUser(result.user)!;
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  @override
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  @override
  Future<void> deleteAccount() async {
    await _auth.currentUser?.delete();
  }
}
```

### Supabase Auth Repository Implementation

```dart
// lib/features/auth/data/repositories/auth_repository_impl.dart (Supabase)
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../domain/entities/user.dart' as app;
import '../../domain/repositories/auth_repository.dart';

class SupabaseAuthRepository implements AuthRepository {
  final SupabaseClient _client;
  final GoogleSignIn _googleSignIn;

  SupabaseAuthRepository({
    SupabaseClient? client,
    GoogleSignIn? googleSignIn,
  })  : _client = client ?? Supabase.instance.client,
        _googleSignIn = googleSignIn ?? GoogleSignIn(
          serverClientId: 'YOUR_WEB_CLIENT_ID',
        );

  @override
  Stream<app.User?> get authStateChanges {
    return _client.auth.onAuthStateChange.map((event) {
      return _mapSupabaseUser(event.session?.user);
    });
  }

  @override
  Future<app.User?> get currentUser async {
    return _mapSupabaseUser(_client.auth.currentUser);
  }

  app.User? _mapSupabaseUser(User? supabaseUser) {
    if (supabaseUser == null) return null;
    return app.User(
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      displayName: supabaseUser.userMetadata?['full_name'],
      photoUrl: supabaseUser.userMetadata?['avatar_url'],
      phoneNumber: supabaseUser.phone,
      emailVerified: supabaseUser.emailConfirmedAt != null,
      createdAt: DateTime.tryParse(supabaseUser.createdAt),
    );
  }

  @override
  Future<app.User> signInWithEmail(String email, String password) async {
    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
    return _mapSupabaseUser(response.user)!;
  }

  @override
  Future<app.User> signUpWithEmail(String email, String password, {String? displayName}) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: displayName != null ? {'full_name': displayName} : null,
    );
    return _mapSupabaseUser(response.user)!;
  }

  @override
  Future<app.User> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) throw Exception('Google sign in cancelled');

    final googleAuth = await googleUser.authentication;
    final response = await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: googleAuth.idToken!,
      accessToken: googleAuth.accessToken,
    );
    return _mapSupabaseUser(response.user)!;
  }

  @override
  Future<app.User> signInWithApple() async {
    final response = await _client.auth.signInWithOAuth(
      OAuthProvider.apple,
      redirectTo: 'your-app-scheme://callback',
    );
    // Note: This requires additional handling for native flow
    throw UnimplementedError('Use native Apple Sign In flow');
  }

  @override
  Future<void> signInWithPhone(
    String phoneNumber, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onError,
  }) async {
    try {
      await _client.auth.signInWithOtp(phone: phoneNumber);
      onCodeSent(phoneNumber); // Supabase uses phone as identifier
    } catch (e) {
      onError(e.toString());
    }
  }

  @override
  Future<app.User> verifyPhoneCode(String verificationId, String code) async {
    final response = await _client.auth.verifyOTP(
      phone: verificationId, // Phone number used as verificationId
      token: code,
      type: OtpType.sms,
    );
    return _mapSupabaseUser(response.user)!;
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }

  @override
  Future<void> signOut() async {
    await _client.auth.signOut();
    await _googleSignIn.signOut();
  }

  @override
  Future<void> deleteAccount() async {
    // Note: Requires server-side function or admin API
    throw UnimplementedError('Implement via Edge Function');
  }
}
```

## State Management Templates

### Riverpod Auth Provider

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) {
  // Return Firebase or Supabase implementation
  throw UnimplementedError();
}

@Riverpod(keepAlive: true)
Stream<User?> authState(AuthStateRef ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
}

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  FutureOr<User?> build() async {
    return ref.watch(authRepositoryProvider).currentUser;
  }

  Future<void> signInWithEmail(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return ref.read(authRepositoryProvider).signInWithEmail(email, password);
    });
  }

  Future<void> signUpWithEmail(String email, String password, {String? displayName}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return ref.read(authRepositoryProvider).signUpWithEmail(
        email,
        password,
        displayName: displayName,
      );
    });
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return ref.read(authRepositoryProvider).signInWithGoogle();
    });
  }

  Future<void> signInWithApple() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return ref.read(authRepositoryProvider).signInWithApple();
    });
  }

  Future<void> sendPasswordResetEmail(String email) async {
    await ref.read(authRepositoryProvider).sendPasswordResetEmail(email);
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}
```

### Bloc Auth Implementation

```dart
// lib/features/auth/presentation/bloc/auth_bloc.dart
import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repository;
  StreamSubscription<User?>? _authSubscription;

  AuthBloc(this._repository) : super(AuthInitial()) {
    on<AuthStarted>(_onStarted);
    on<AuthUserChanged>(_onUserChanged);
    on<AuthSignInWithEmail>(_onSignInWithEmail);
    on<AuthSignUpWithEmail>(_onSignUpWithEmail);
    on<AuthSignInWithGoogle>(_onSignInWithGoogle);
    on<AuthSignInWithApple>(_onSignInWithApple);
    on<AuthSignOut>(_onSignOut);
    on<AuthPasswordResetRequested>(_onPasswordResetRequested);
  }

  Future<void> _onStarted(AuthStarted event, Emitter<AuthState> emit) async {
    _authSubscription?.cancel();
    _authSubscription = _repository.authStateChanges.listen((user) {
      add(AuthUserChanged(user));
    });
  }

  void _onUserChanged(AuthUserChanged event, Emitter<AuthState> emit) {
    if (event.user != null) {
      emit(AuthAuthenticated(event.user!));
    } else {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onSignInWithEmail(AuthSignInWithEmail event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await _repository.signInWithEmail(event.email, event.password);
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onSignUpWithEmail(AuthSignUpWithEmail event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await _repository.signUpWithEmail(
        event.email,
        event.password,
        displayName: event.displayName,
      );
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onSignInWithGoogle(AuthSignInWithGoogle event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await _repository.signInWithGoogle();
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onSignInWithApple(AuthSignInWithApple event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await _repository.signInWithApple();
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onSignOut(AuthSignOut event, Emitter<AuthState> emit) async {
    await _repository.signOut();
  }

  Future<void> _onPasswordResetRequested(
    AuthPasswordResetRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _repository.sendPasswordResetEmail(event.email);
      emit(AuthPasswordResetSent());
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  @override
  Future<void> close() {
    _authSubscription?.cancel();
    return super.close();
  }
}
```

## UI Templates

### Login Page

```dart
// lib/features/auth/presentation/pages/login_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/social_login_buttons.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (_formKey.currentState?.validate() ?? false) {
      await ref.read(authNotifierProvider.notifier).signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    ref.listen(authNotifierProvider, (_, state) {
      state.whenOrNull(
        error: (error, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error.toString())),
          );
        },
      );
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Sign In')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AuthTextField(
                  controller: _emailController,
                  label: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Email is required';
                    if (!value!.contains('@')) return 'Invalid email';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                AuthTextField(
                  controller: _passwordController,
                  label: 'Password',
                  obscureText: true,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Password is required';
                    if (value!.length < 6) return 'Password too short';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      // Navigate to forgot password
                    },
                    child: const Text('Forgot Password?'),
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: authState.isLoading ? null : _signIn,
                  child: authState.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Sign In'),
                ),
                const SizedBox(height: 24),
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text('OR'),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 24),
                const SocialLoginButtons(),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account?"),
                    TextButton(
                      onPressed: () {
                        // Navigate to register
                      },
                      child: const Text('Sign Up'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### Auth Guard (go_router)

```dart
// lib/features/auth/presentation/guards/auth_guard.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

String? authGuard(BuildContext context, GoRouterState state) {
  final container = ProviderScope.containerOf(context);
  final authState = container.read(authStateProvider);

  return authState.when(
    data: (user) {
      final isAuthenticated = user != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      if (!isAuthenticated && !isAuthRoute) {
        return '/auth/login?redirect=${state.matchedLocation}';
      }

      if (isAuthenticated && isAuthRoute) {
        return state.uri.queryParameters['redirect'] ?? '/';
      }

      return null;
    },
    loading: () => null,
    error: (_, __) => '/auth/login',
  );
}

// Router configuration example
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    redirect: (context, state) => authGuard(context, state),
    routes: [
      // Your routes here
    ],
  );
});
```

## Required Dependencies

### Firebase

```yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  google_sign_in: ^6.2.0
  sign_in_with_apple: ^6.0.0
```

### Supabase

```yaml
dependencies:
  supabase_flutter: ^2.5.0
  google_sign_in: ^6.2.0
  sign_in_with_apple: ^6.0.0
```

## Execution Steps

When `/flutter-add-auth` is invoked:

1. Parse backend and options
2. Check for existing auth feature (warn if exists)
3. Add required dependencies to pubspec.yaml
4. Create feature directory structure
5. Generate entity and repository files
6. Generate state management files based on `--state`
7. Generate UI pages (login, register, forgot password)
8. Generate auth guard if `--guards`
9. Run `dart run build_runner build`
10. Output setup instructions

## Output Summary

```
Auth Feature Created
====================

Backend: Firebase
Methods: email, google, apple
State Management: Riverpod

Files Created:
Domain Layer:
  - lib/features/auth/domain/entities/user.dart
  - lib/features/auth/domain/repositories/auth_repository.dart

Data Layer:
  - lib/features/auth/data/repositories/auth_repository_impl.dart

Presentation Layer:
  - lib/features/auth/presentation/providers/auth_provider.dart
  - lib/features/auth/presentation/pages/login_page.dart
  - lib/features/auth/presentation/pages/register_page.dart
  - lib/features/auth/presentation/pages/forgot_password_page.dart
  - lib/features/auth/presentation/guards/auth_guard.dart

Dependencies Added:
  - firebase_auth: ^5.0.0
  - google_sign_in: ^6.2.0
  - sign_in_with_apple: ^6.0.0

Next Steps:
1. Run: flutter pub get
2. Run: dart run build_runner build
3. Configure Firebase/Supabase in your app
4. Set up OAuth credentials for Google/Apple
5. Add auth routes to your router
6. Wrap app with auth state listener
```

## Validation

The command validates the following before execution:

- **No existing auth**: Warns if auth feature already exists
- **Backend setup**: Checks if Firebase/Supabase is initialized
- **Valid methods**: Validates auth method names
- **State manager**: Verifies state management package is installed

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Auth feature exists | `lib/features/auth/` already exists | Use different feature-name or remove existing |
| Backend not initialized | Firebase/Supabase not set up | Run `/flutter-firebase-init` or `/flutter-supabase-init` |
| Invalid auth method | Unrecognized method name | Use: email, google, apple, phone |
| Missing OAuth config | Google/Apple credentials not configured | Set up OAuth in Firebase/Supabase console |

## Agent Reference

For authentication-specific guidance:

- **Firebase Auth**: Consult the `flutter-firebase-auth` agent for Firebase-specific configuration, custom claims, and security rules
- **Supabase Auth**: Consult the `flutter-supabase-auth` agent for Supabase-specific configuration, RLS policies, and JWT handling
- **State Management**: Consult the `flutter-state-manager` agent for auth state persistence and token refresh strategies
- **Security**: Consult the `flutter-architect` agent for secure storage, token management, and auth flow best practices
