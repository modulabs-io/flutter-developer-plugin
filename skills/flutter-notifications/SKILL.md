# /flutter-notifications

Set up push notifications and local notifications for Flutter applications.

## Usage

```
/flutter-notifications <type> [options]
```

## Types

- `fcm`: Firebase Cloud Messaging setup
- `local`: Local notifications setup
- `both`: Combined FCM and local notifications

## Options

- `--platform <platforms>`: Target platforms (android, ios, web)
- `--rich`: Enable rich notifications (images, actions)
- `--scheduled`: Enable scheduled notifications
- `--deeplink`: Configure deep linking from notifications

## Examples

```
/flutter-notifications fcm --platform android,ios
/flutter-notifications local --scheduled
/flutter-notifications both --rich --deeplink
```

## Instructions

When the user invokes `/flutter-notifications`, follow these steps:

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  # Firebase Cloud Messaging
  firebase_core: ^3.8.0
  firebase_messaging: ^15.1.5

  # Local notifications
  flutter_local_notifications: ^18.0.1

  # Timezone for scheduled notifications
  timezone: ^0.9.4
```

```bash
flutter pub get
```

### 2. Firebase Cloud Messaging Setup

#### Android Configuration

**android/app/build.gradle**:
```groovy
android {
    defaultConfig {
        minSdkVersion 21  // Required for FCM
    }
}
```

**android/app/src/main/AndroidManifest.xml**:
```xml
<manifest>
    <!-- FCM permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE"/>

    <application>
        <!-- FCM default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="high_importance_channel"/>

        <!-- FCM default notification icon -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification"/>

        <!-- FCM default notification color -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/notification_color"/>
    </application>
</manifest>
```

Create notification icon at `android/app/src/main/res/drawable/ic_notification.xml`:
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M12,22c1.1,0 2,-0.9 2,-2h-4c0,1.1 0.89,2 2,2zM18,16v-5c0,-3.07 -1.64,-5.64 -4.5,-6.32V4c0,-0.83 -0.67,-1.5 -1.5,-1.5s-1.5,0.67 -1.5,1.5v0.68C7.63,5.36 6,7.92 6,11v5l-2,2v1h16v-1l-2,-2z"/>
</vector>
```

#### iOS Configuration

**ios/Runner/AppDelegate.swift**:
```swift
import UIKit
import Flutter
import FirebaseCore
import FirebaseMessaging

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    FirebaseApp.configure()

    // Request notification permissions
    UNUserNotificationCenter.current().delegate = self

    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: { _, _ in }
    )

    application.registerForRemoteNotifications()

    // Set FCM messaging delegate
    Messaging.messaging().delegate = self

    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Handle APNs token
  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken
  }
}

// MARK: - MessagingDelegate
extension AppDelegate: MessagingDelegate {
  func messaging(
    _ messaging: Messaging,
    didReceiveRegistrationToken fcmToken: String?
  ) {
    print("FCM Token: \(fcmToken ?? "")")
    // Send token to your server
  }
}
```

**ios/Runner/Info.plist** - Add background modes:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

### 3. FCM Implementation

**lib/services/notification_service.dart**:
```dart
import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  await NotificationService.instance.setupFlutterNotifications();
  await NotificationService.instance.showNotification(message);
}

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    // Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Request permissions
    await _requestPermissions();

    // Setup local notifications
    await setupFlutterNotifications();

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

    // Check for initial message (app opened from terminated state)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageOpenedApp(initialMessage);
    }

    // Get FCM token
    final token = await _messaging.getToken();
    print('FCM Token: $token');

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((newToken) {
      print('FCM Token refreshed: $newToken');
      // Send to your server
    });

    _isInitialized = true;
  }

  Future<void> _requestPermissions() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    print('Permission status: ${settings.authorizationStatus}');

    // For iOS provisional notifications (quiet notifications)
    // await _messaging.requestPermission(provisional: true);
  }

  Future<void> setupFlutterNotifications() async {
    // Android notification channel
    const androidChannel = AndroidNotificationChannel(
      'high_importance_channel',
      'High Importance Notifications',
      description: 'This channel is used for important notifications.',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);

    // Initialize settings
    const initializationSettings = InitializationSettings(
      android: AndroidInitializationSettings('@drawable/ic_notification'),
      iOS: DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      ),
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Foreground message: ${message.messageId}');
    showNotification(message);
  }

  void _handleMessageOpenedApp(RemoteMessage message) {
    print('Message opened app: ${message.data}');
    // Navigate based on message data
    _handleNotificationNavigation(message.data);
  }

  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      final data = jsonDecode(response.payload!);
      _handleNotificationNavigation(data);
    }
  }

  void _handleNotificationNavigation(Map<String, dynamic> data) {
    // Implement your navigation logic
    final route = data['route'];
    final id = data['id'];

    if (route != null) {
      // Navigate to route
      // NavigationService.navigateTo(route, arguments: {'id': id});
    }
  }

  Future<void> showNotification(RemoteMessage message) async {
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null) {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'high_importance_channel',
            'High Importance Notifications',
            channelDescription: 'Important notifications',
            importance: Importance.high,
            priority: Priority.high,
            icon: android?.smallIcon ?? '@drawable/ic_notification',
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: jsonEncode(message.data),
      );
    }
  }

  // Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  // Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }

  // Get current FCM token
  Future<String?> getToken() async {
    return await _messaging.getToken();
  }
}
```

### 4. Local Notifications Setup

**lib/services/local_notification_service.dart**:
```dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class LocalNotificationService {
  LocalNotificationService._();
  static final LocalNotificationService instance = LocalNotificationService._();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // Initialize timezone
    tz.initializeTimeZones();

    const androidSettings =
        AndroidInitializationSettings('@drawable/ic_notification');

    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Request Android 13+ permission
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  void _onNotificationTapped(NotificationResponse response) {
    print('Notification tapped: ${response.payload}');
    // Handle navigation
  }

  // Show immediate notification
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'default_channel',
      'Default Notifications',
      channelDescription: 'Default notification channel',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(id, title, body, details, payload: payload);
  }

  // Schedule notification
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'scheduled_channel',
      'Scheduled Notifications',
      channelDescription: 'Scheduled notification channel',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }

  // Show notification with actions
  Future<void> showNotificationWithActions({
    required int id,
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'actions_channel',
      'Action Notifications',
      channelDescription: 'Notifications with actions',
      importance: Importance.high,
      priority: Priority.high,
      actions: [
        AndroidNotificationAction('accept', 'Accept'),
        AndroidNotificationAction('decline', 'Decline'),
      ],
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      categoryIdentifier: 'actionCategory',
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(id, title, body, details);
  }

  // Show notification with image
  Future<void> showBigPictureNotification({
    required int id,
    required String title,
    required String body,
    required String imagePath,
  }) async {
    final bigPictureStyle = BigPictureStyleInformation(
      FilePathAndroidBitmap(imagePath),
      contentTitle: title,
      summaryText: body,
    );

    final androidDetails = AndroidNotificationDetails(
      'image_channel',
      'Image Notifications',
      channelDescription: 'Notifications with images',
      importance: Importance.high,
      priority: Priority.high,
      styleInformation: bigPictureStyle,
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      attachments: [DarwinNotificationAttachment(imagePath)],
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(id, title, body, details);
  }

  // Periodic notification
  Future<void> showPeriodicNotification({
    required int id,
    required String title,
    required String body,
    required RepeatInterval interval,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'periodic_channel',
      'Periodic Notifications',
      channelDescription: 'Periodic notification channel',
    );

    const details = NotificationDetails(android: androidDetails);

    await _notifications.periodicallyShow(
      id,
      title,
      body,
      interval,
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  // Cancel notification
  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  // Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }
}
```

### 5. Initialize in Main

**lib/main.dart**:
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize notifications
  await NotificationService.instance.initialize();

  runApp(const MyApp());
}
```

### 6. Android 13+ Runtime Permission

```dart
import 'package:permission_handler/permission_handler.dart';

Future<void> requestNotificationPermission() async {
  if (await Permission.notification.isDenied) {
    await Permission.notification.request();
  }
}
```

Add to `pubspec.yaml`:
```yaml
dependencies:
  permission_handler: ^11.3.1
```

### 7. Deep Linking from Notifications

Configure notification payload:
```dart
// When sending notification (server-side)
{
  "notification": {
    "title": "New Message",
    "body": "You have a new message"
  },
  "data": {
    "route": "/chat",
    "chatId": "123",
    "click_action": "FLUTTER_NOTIFICATION_CLICK"
  }
}
```

Handle in app:
```dart
void _handleNotificationNavigation(Map<String, dynamic> data) {
  final route = data['route'] as String?;

  switch (route) {
    case '/chat':
      final chatId = data['chatId'] as String?;
      Navigator.pushNamed(context, '/chat', arguments: chatId);
      break;
    case '/order':
      final orderId = data['orderId'] as String?;
      Navigator.pushNamed(context, '/order', arguments: orderId);
      break;
    default:
      // Navigate to home
      Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
  }
}
```

### 8. Notification Channels (Android)

```dart
Future<void> createNotificationChannels() async {
  final androidPlugin = _localNotifications
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();

  if (androidPlugin != null) {
    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        'messages',
        'Messages',
        description: 'New message notifications',
        importance: Importance.high,
        sound: RawResourceAndroidNotificationSound('message_sound'),
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        'updates',
        'Updates',
        description: 'App update notifications',
        importance: Importance.low,
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        'promotions',
        'Promotions',
        description: 'Promotional notifications',
        importance: Importance.min,
      ),
    );
  }
}
```

### 9. Testing Notifications

```bash
# Send test FCM message via curl
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "FCM_TOKEN_HERE",
      "notification": {
        "title": "Test Notification",
        "body": "This is a test message"
      },
      "data": {
        "route": "/test",
        "id": "123"
      }
    }
  }' \
  "https://fcm.googleapis.com/v1/projects/PROJECT_ID/messages:send"
```

### 10. Output Summary

```
Notification Setup Complete
===========================

Type: FCM + Local Notifications
Platforms: Android, iOS

Dependencies Added:
- firebase_messaging: ^15.1.5
- flutter_local_notifications: ^18.0.1
- timezone: ^0.9.4

Files Created/Updated:
- lib/services/notification_service.dart
- lib/services/local_notification_service.dart
- android/app/src/main/AndroidManifest.xml
- ios/Runner/AppDelegate.swift

Notification Channels:
- high_importance_channel (default)
- messages
- updates
- promotions

Next Steps:
1. Add FCM server key to backend
2. Test foreground notifications
3. Test background notifications
4. Test notification tap navigation
5. Configure notification categories for iOS
```

## Agent Reference

For Firebase configuration, consult the `flutter-firebase-services` agent. For platform-specific notification setup, consult the `flutter-android-platform` and `flutter-ios-platform` agents.
