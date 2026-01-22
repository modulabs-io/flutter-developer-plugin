# /flutter-supabase-auth

Add Supabase Authentication to a Flutter project.

## Usage

```
/flutter-supabase-auth [options]
```

## Options

- `--providers <list>`: Auth providers (email,google,apple,github,magic)
- `--state <manager>`: State management (riverpod|bloc|provider)

## Examples

```
/flutter-supabase-auth
/flutter-supabase-auth --providers email,google,apple
/flutter-supabase-auth --providers email,magic --state riverpod
```

## Instructions

When the user invokes `/flutter-supabase-auth`, follow these steps:

### 1. Add Dependencies

```bash
flutter pub add supabase_flutter
flutter pub add google_sign_in        # For Google OAuth
flutter pub add sign_in_with_apple    # For Apple OAuth
```

### 2. Create Auth Repository

```dart
// lib/features/auth/data/repositories/auth_repository.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  final GoTrueClient _auth;

  AuthRepository({GoTrueClient? auth})
      : _auth = auth ?? Supabase.instance.client.auth;

  // Auth state
  Stream<AuthState> get authStateChanges => _auth.onAuthStateChange;
  User? get currentUser => _auth.currentUser;
  Session? get currentSession => _auth.currentSession;

  // Email/Password
  Future<User> signUpWithEmail(String email, String password) async {
    final response = await _auth.signUp(email: email, password: password);
    if (response.user == null) throw AuthException('Sign up failed');
    return response.user!;
  }

  Future<User> signInWithEmail(String email, String password) async {
    final response = await _auth.signInWithPassword(
      email: email,
      password: password,
    );
    if (response.user == null) throw AuthException('Sign in failed');
    return response.user!;
  }

  // Magic Link
  Future<void> sendMagicLink(String email) async {
    await _auth.signInWithOtp(
      email: email,
      emailRedirectTo: 'myapp://login-callback',
    );
  }

  // OAuth
  Future<bool> signInWithGoogle() async {
    return await _auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'myapp://login-callback',
    );
  }

  Future<bool> signInWithApple() async {
    return await _auth.signInWithOAuth(
      OAuthProvider.apple,
      redirectTo: 'myapp://login-callback',
    );
  }

  Future<bool> signInWithGitHub() async {
    return await _auth.signInWithOAuth(
      OAuthProvider.github,
      redirectTo: 'myapp://login-callback',
    );
  }

  // Password reset
  Future<void> resetPassword(String email) async {
    await _auth.resetPasswordForEmail(
      email,
      redirectTo: 'myapp://reset-password',
    );
  }

  // Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}
```

### 3. Create Auth Provider (Riverpod)

```dart
// lib/features/auth/presentation/providers/auth_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) {
  return AuthRepository();
}

@Riverpod(keepAlive: true)
Stream<AuthState> authState(AuthStateRef ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
}

@riverpod
User? currentUser(CurrentUserRef ref) {
  final state = ref.watch(authStateProvider);
  return state.whenOrNull(data: (s) => s.session?.user);
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
    await ref.read(authRepositoryProvider).signInWithGoogle();
  }

  Future<void> signInWithApple() async {
    state = const AsyncLoading();
    await ref.read(authRepositoryProvider).signInWithApple();
  }

  Future<void> sendMagicLink(String email) async {
    await ref.read(authRepositoryProvider).sendMagicLink(email);
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}
```

### 4. Create Login Page

```dart
// lib/features/auth/presentation/pages/login_page.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLogin = true;

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
      appBar: AppBar(title: Text(_isLogin ? 'Login' : 'Sign Up')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 24),

            // Email/Password button
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: authState.isLoading ? null : _submitForm,
                child: authState.isLoading
                    ? const CircularProgressIndicator()
                    : Text(_isLogin ? 'Login' : 'Sign Up'),
              ),
            ),

            // Toggle login/signup
            TextButton(
              onPressed: () => setState(() => _isLogin = !_isLogin),
              child: Text(_isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'),
            ),

            const SizedBox(height: 24),
            const Text('Or continue with'),
            const SizedBox(height: 16),

            // Social login buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _SocialButton(
                  icon: Icons.g_mobiledata,
                  onPressed: () => ref.read(authProvider.notifier).signInWithGoogle(),
                ),
                const SizedBox(width: 16),
                if (Platform.isIOS || Platform.isMacOS)
                  _SocialButton(
                    icon: Icons.apple,
                    onPressed: () => ref.read(authProvider.notifier).signInWithApple(),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _submitForm() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (_isLogin) {
      ref.read(authProvider.notifier).signInWithEmail(email, password);
    } else {
      ref.read(authProvider.notifier).signUpWithEmail(email, password);
    }
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _SocialButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return IconButton.filled(
      onPressed: onPressed,
      icon: Icon(icon),
      iconSize: 32,
    );
  }
}
```

### 5. Create Auth Guard

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
      data: (state) {
        if (state.session == null) return const LoginPage();
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

### 6. Configure Deep Links

#### iOS (ios/Runner/Info.plist)
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>
```

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" android:host="login-callback" />
</intent-filter>
```

### 7. Configure Supabase Dashboard

1. Go to Authentication > Providers
2. Enable desired providers
3. Configure OAuth credentials
4. Add redirect URLs:
   - `myapp://login-callback`
   - `myapp://reset-password`

### 8. Run Code Generation

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 9. Output Summary

```
Supabase Authentication Setup Complete
======================================

Providers Configured:
- Email/Password ✓
- Magic Link ✓
- Google OAuth ✓
- Apple OAuth ✓

Files Created:
- lib/features/auth/data/repositories/auth_repository.dart
- lib/features/auth/presentation/providers/auth_provider.dart
- lib/features/auth/presentation/pages/login_page.dart
- lib/features/auth/presentation/widgets/auth_guard.dart

Platform Configuration:
- iOS: URL scheme configured
- Android: Intent filter configured

Supabase Dashboard:
1. Enable providers in Authentication > Providers
2. Add redirect URLs: myapp://login-callback

Next Steps:
1. Run `dart run build_runner build`
2. Configure OAuth credentials in Supabase Dashboard
3. Test authentication flow
```

## Agent Reference

For authentication patterns, consult the `flutter-supabase-auth` agent.
