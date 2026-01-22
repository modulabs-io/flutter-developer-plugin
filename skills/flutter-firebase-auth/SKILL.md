# /flutter-firebase-auth

Add Firebase Authentication to a Flutter project.

## Usage

```
/flutter-firebase-auth [options]
```

## Options

- `--providers <list>`: Auth providers (email,google,apple,phone,anonymous)
- `--state <manager>`: State management (riverpod|bloc|provider)

## Examples

```
/flutter-firebase-auth
/flutter-firebase-auth --providers email,google,apple
/flutter-firebase-auth --providers email,phone --state riverpod
```

## Instructions

When the user invokes `/flutter-firebase-auth`, follow these steps:

### 1. Add Dependencies

```bash
# Core auth
flutter pub add firebase_auth

# OAuth providers
flutter pub add google_sign_in
flutter pub add sign_in_with_apple
```

```yaml
# pubspec.yaml
dependencies:
  firebase_auth: ^4.17.8
  google_sign_in: ^6.2.1       # For Google Sign-In
  sign_in_with_apple: ^6.0.0   # For Apple Sign-In
  crypto: ^3.0.3               # For Apple Sign-In nonce
```

### 2. Platform Configuration

#### Google Sign-In - Android

Add SHA-1 and SHA-256 fingerprints to Firebase Console:
```bash
# Debug key
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release key (create if doesn't exist)
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
keytool -list -v -keystore upload-keystore.jks -alias upload
```

#### Google Sign-In - iOS

Add URL scheme to `ios/Runner/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <!-- Get this from GoogleService-Info.plist REVERSED_CLIENT_ID -->
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

#### Apple Sign-In - iOS

1. Enable "Sign In with Apple" capability in Xcode
2. Configure in Firebase Console > Authentication > Sign-in method

### 3. Create Auth Repository

```dart
// lib/features/auth/data/repositories/auth_repository.dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';

class AuthRepository {
  final FirebaseAuth _auth;
  final GoogleSignIn _googleSignIn;

  AuthRepository({
    FirebaseAuth? auth,
    GoogleSignIn? googleSignIn,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _googleSignIn = googleSignIn ?? GoogleSignIn();

  // Auth state stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Current user
  User? get currentUser => _auth.currentUser;

  // Email/Password Sign In
  Future<User> signInWithEmail(String email, String password) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return credential.user!;
  }

  // Email/Password Sign Up
  Future<User> signUpWithEmail(String email, String password) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    return credential.user!;
  }

  // Google Sign In
  Future<User> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) throw AuthException('Google sign-in cancelled');

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await _auth.signInWithCredential(credential);
    return userCredential.user!;
  }

  // Apple Sign In
  Future<User> signInWithApple() async {
    final rawNonce = _generateNonce();
    final nonce = _sha256ofString(rawNonce);

    final appleCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
      nonce: nonce,
    );

    final oauthCredential = OAuthProvider('apple.com').credential(
      idToken: appleCredential.identityToken,
      rawNonce: rawNonce,
    );

    final userCredential = await _auth.signInWithCredential(oauthCredential);
    return userCredential.user!;
  }

  // Anonymous Sign In
  Future<User> signInAnonymously() async {
    final credential = await _auth.signInAnonymously();
    return credential.user!;
  }

  // Password Reset
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Sign Out
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  String _generateNonce([int length = 32]) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)]).join();
  }

  String _sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
  @override
  String toString() => message;
}
```

### 4. Create Auth Provider (Riverpod)

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/auth_repository.dart';

part 'auth_provider.g.dart';

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  return AuthRepository();
}

@riverpod
Stream<User?> authState(AuthStateRef ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
}

@riverpod
class Auth extends _$Auth {
  @override
  FutureOr<User?> build() {
    return ref.watch(authRepositoryProvider).currentUser;
  }

  Future<void> signInWithEmail(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(authRepositoryProvider).signInWithEmail(email, password),
    );
  }

  Future<void> signUpWithEmail(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(authRepositoryProvider).signUpWithEmail(email, password),
    );
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(authRepositoryProvider).signInWithGoogle(),
    );
  }

  Future<void> signInWithApple() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
      ref.read(authRepositoryProvider).signInWithApple(),
    );
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}
```

### 5. Create Login Page

```dart
// lib/features/auth/presentation/pages/login_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

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

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen(authProvider, (previous, next) {
      next.whenOrNull(
        error: (error, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error.toString())),
          );
        },
      );
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter password';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: authState.isLoading ? null : _signInWithEmail,
                  child: authState.isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Sign In'),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Or sign in with'),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: authState.isLoading ? null : _signInWithGoogle,
                    icon: const Icon(Icons.g_mobiledata),
                  ),
                  IconButton(
                    onPressed: authState.isLoading ? null : _signInWithApple,
                    icon: const Icon(Icons.apple),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _signInWithEmail() {
    if (_formKey.currentState!.validate()) {
      ref.read(authProvider.notifier).signInWithEmail(
        _emailController.text,
        _passwordController.text,
      );
    }
  }

  void _signInWithGoogle() {
    ref.read(authProvider.notifier).signInWithGoogle();
  }

  void _signInWithApple() {
    ref.read(authProvider.notifier).signInWithApple();
  }
}
```

### 6. Create Auth Guard

```dart
// lib/features/auth/presentation/widgets/auth_guard.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../pages/login_page.dart';

class AuthGuard extends ConsumerWidget {
  final Widget child;

  const AuthGuard({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (user) {
        if (user == null) {
          return const LoginPage();
        }
        return child;
      },
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => const LoginPage(),
    );
  }
}
```

### 7. Enable Auth Providers in Firebase Console

Navigate to Firebase Console > Authentication > Sign-in method and enable:
- Email/Password
- Google
- Apple
- Phone (if needed)
- Anonymous (if needed)

### 8. Run Code Generation (for Riverpod)

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 9. Output Summary

```
Firebase Authentication Setup Complete
======================================

Providers Configured:
- Email/Password ✓
- Google Sign-In ✓
- Apple Sign-In ✓

Files Created:
- lib/features/auth/data/repositories/auth_repository.dart
- lib/features/auth/presentation/providers/auth_provider.dart
- lib/features/auth/presentation/pages/login_page.dart
- lib/features/auth/presentation/widgets/auth_guard.dart

Dependencies Added:
- firebase_auth: ^4.17.8
- google_sign_in: ^6.2.1
- sign_in_with_apple: ^6.0.0
- crypto: ^3.0.3

Platform Setup Required:
- Android: Add SHA-1/SHA-256 to Firebase Console
- iOS: Add REVERSED_CLIENT_ID URL scheme
- iOS: Enable "Sign In with Apple" capability

Firebase Console Setup:
1. Go to Authentication > Sign-in method
2. Enable Email/Password, Google, Apple providers

Next Steps:
1. Run `dart run build_runner build`
2. Complete platform-specific setup
3. Test authentication flow
```

## Agent Reference

For authentication patterns, consult the `flutter-firebase-auth` agent.
