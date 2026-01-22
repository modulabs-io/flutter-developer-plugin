# /flutter-android-adb

Manage Android devices with ADB (Android Debug Bridge) for debugging and testing.

## Usage

```
/flutter-android-adb [command] [options]
```

## Commands

- `devices`: List connected devices
- `connect <ip>`: Connect to wireless device
- `install <apk>`: Install APK on device
- `uninstall <package>`: Remove app from device
- `logcat`: View device logs
- `shell`: Open device shell
- `screenshot`: Capture screenshot
- `screenrecord`: Record screen video

## Options

- `-s <device>`: Target specific device
- `--wireless`: Enable wireless debugging
- `--clear`: Clear app data before install

## Examples

```
/flutter-android-adb devices
/flutter-android-adb connect 192.168.1.100
/flutter-android-adb logcat --filter flutter
/flutter-android-adb screenshot
```

## Instructions

When the user invokes `/flutter-android-adb`, follow these steps:

### 1. Check ADB Installation

```bash
# Check ADB version
adb --version

# If not found, install via Android SDK or:
# macOS
brew install android-platform-tools

# Linux
sudo apt install android-tools-adb

# Windows
# Download from https://developer.android.com/studio/releases/platform-tools
```

### 2. List Connected Devices

```bash
# Basic device list
adb devices

# Detailed device list
adb devices -l

# Output example:
# List of devices attached
# emulator-5554         device
# 1A2B3C4D5E6F7G8H      device

# Check device properties
adb shell getprop ro.product.model
adb shell getprop ro.build.version.sdk
adb shell getprop ro.build.version.release
```

### 3. Wireless Debugging

#### Android 11+ (Native Wireless Debugging)

```bash
# 1. Enable Wireless debugging on device:
#    Settings → Developer options → Wireless debugging → Enable
#    Tap "Pair device with pairing code"

# 2. Pair with device (one-time)
adb pair 192.168.1.100:37099
# Enter pairing code shown on device

# 3. Connect
adb connect 192.168.1.100:41245
# Use port shown in Wireless debugging settings
```

#### Android 10 and below (TCP/IP)

```bash
# 1. Connect device via USB first
adb devices

# 2. Enable TCP/IP mode
adb tcpip 5555

# 3. Get device IP
adb shell ip addr show wlan0 | grep inet
# or check: Settings → About phone → Status → IP address

# 4. Disconnect USB, then connect via WiFi
adb connect 192.168.1.100:5555

# 5. Verify connection
adb devices
```

### 4. Install/Uninstall Apps

```bash
# Install APK
adb install app-release.apk

# Install with options
adb install -r app-release.apk  # Replace existing
adb install -d app-release.apk  # Allow downgrade
adb install -t app-release.apk  # Allow test APK
adb install -g app-release.apk  # Grant all permissions

# Install on specific device
adb -s emulator-5554 install app-release.apk

# Uninstall app
adb uninstall com.example.myapp

# Uninstall but keep data
adb uninstall -k com.example.myapp

# Clear app data
adb shell pm clear com.example.myapp
```

### 5. View Logs (Logcat)

```bash
# All logs
adb logcat

# Clear logs first
adb logcat -c

# Filter by tag
adb logcat -s flutter
adb logcat -s "MyTag:V" "*:S"

# Filter by priority
adb logcat "*:W"   # Warnings and above
adb logcat "*:E"   # Errors only

# Filter Flutter logs
adb logcat | grep -E "(flutter|dart)"

# Save logs to file
adb logcat > logs.txt

# Log with timestamp
adb logcat -v time

# Log specific buffer
adb logcat -b main    # Main log
adb logcat -b crash   # Crash logs
adb logcat -b events  # Event logs

# Dump crash logs
adb shell dumpsys dropbox --print > crash_logs.txt
```

### 6. Device Shell

```bash
# Open interactive shell
adb shell

# Run single command
adb shell ls /sdcard/

# Common shell commands
adb shell pm list packages              # List installed apps
adb shell pm list packages | grep example
adb shell dumpsys package com.example.myapp  # App info
adb shell am start -n com.example.myapp/.MainActivity  # Start activity
adb shell am force-stop com.example.myapp  # Force stop app

# File operations
adb shell ls -la /sdcard/
adb shell mkdir /sdcard/MyFolder
adb shell rm /sdcard/myfile.txt

# System info
adb shell dumpsys battery
adb shell dumpsys meminfo
adb shell dumpsys cpuinfo
adb shell df -h
```

### 7. File Transfer

```bash
# Push file to device
adb push local_file.txt /sdcard/
adb push ./folder/ /sdcard/folder/

# Pull file from device
adb pull /sdcard/file.txt ./
adb pull /sdcard/Download/ ./downloads/

# Pull app APK
adb shell pm path com.example.myapp
adb pull /data/app/com.example.myapp-xxx/base.apk ./app.apk
```

### 8. Screenshot and Screen Recording

```bash
# Screenshot
adb exec-out screencap -p > screenshot.png

# Screenshot to device, then pull
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Screen recording (max 3 minutes)
adb shell screenrecord /sdcard/demo.mp4

# With options
adb shell screenrecord --time-limit 30 /sdcard/demo.mp4  # 30 seconds
adb shell screenrecord --size 720x1280 /sdcard/demo.mp4  # Resolution
adb shell screenrecord --bit-rate 4000000 /sdcard/demo.mp4  # 4Mbps

# Pull recording after Ctrl+C or timeout
adb pull /sdcard/demo.mp4
```

### 9. Deep Links and Intents

```bash
# Open URL in browser
adb shell am start -a android.intent.action.VIEW -d "https://example.com"

# Open app with deep link
adb shell am start -a android.intent.action.VIEW \
  -d "myapp://callback?token=abc123" \
  com.example.myapp

# Send broadcast
adb shell am broadcast -a com.example.MY_ACTION

# Start specific activity
adb shell am start -n com.example.myapp/.SettingsActivity

# Start with extras
adb shell am start -n com.example.myapp/.MainActivity \
  --es "key" "value" \
  --ei "count" 42 \
  --ez "enabled" true
```

### 10. Performance and Debugging

```bash
# Memory info for app
adb shell dumpsys meminfo com.example.myapp

# CPU usage
adb shell top -m 10

# Network stats
adb shell dumpsys netstats

# Battery stats
adb shell dumpsys battery
adb shell dumpsys batterystats

# GPU rendering
adb shell dumpsys gfxinfo com.example.myapp

# Enable GPU profiling
adb shell setprop debug.hwui.profile true

# Enable strict mode
adb shell setprop persist.sys.strictmode.visual 1
```

### 11. Device Control

```bash
# Reboot device
adb reboot

# Reboot to recovery
adb reboot recovery

# Reboot to bootloader
adb reboot bootloader

# Input text
adb shell input text "Hello"

# Key events
adb shell input keyevent 3      # Home
adb shell input keyevent 4      # Back
adb shell input keyevent 26     # Power
adb shell input keyevent 82     # Menu
adb shell input keyevent 187    # App switch

# Tap coordinates
adb shell input tap 500 500

# Swipe
adb shell input swipe 500 1500 500 500 300  # x1 y1 x2 y2 duration(ms)

# Change screen orientation
adb shell settings put system accelerometer_rotation 0  # Disable auto-rotate
adb shell settings put system user_rotation 0  # Portrait
adb shell settings put system user_rotation 1  # Landscape
```

### 12. Multiple Devices

```bash
# List all devices
adb devices -l

# Target specific device
adb -s emulator-5554 shell
adb -s 1A2B3C4D5E6F7G8H install app.apk

# Target by transport ID
adb -t 1 shell

# Environment variable for default device
export ANDROID_SERIAL=emulator-5554
adb shell  # Uses emulator-5554
```

### 13. Troubleshooting

```bash
# Restart ADB server
adb kill-server
adb start-server

# Device not authorized
# 1. Check device for authorization dialog
# 2. If not shown:
adb kill-server
rm -rf ~/.android/adbkey*
adb start-server
# Reconnect device and accept authorization

# Device offline
adb kill-server
adb start-server
# Or: reconnect USB cable

# Connection refused (wireless)
# Check IP address is correct
# Ensure device and computer on same network
# Check firewall settings

# Insufficient permissions (Linux)
# Add udev rules
sudo nano /etc/udev/rules.d/51-android.rules
# Add: SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"
sudo udevadm control --reload-rules

# Windows driver issues
# Install Google USB Driver from SDK Manager
```

### 14. Output Summary

```
ADB Device Management Complete
==============================

Connected Devices:
1. emulator-5554 (Android 14, API 34)
   Model: sdk_gphone64_x86_64
   Status: device

2. ABCD1234 (Android 13, API 33)
   Model: Pixel 7
   Status: device (wireless: 192.168.1.100:5555)

Recent Actions:
- Installed: com.example.myapp (v1.0.0, build 10)
- Screenshot saved: ./screenshot.png
- Logcat filtered: flutter tag

Common Commands:
- adb devices               # List devices
- adb logcat -s flutter     # Flutter logs
- adb install app.apk       # Install app
- adb shell                 # Device shell

Wireless Debugging:
- Enabled on: ABCD1234
- IP: 192.168.1.100:5555
- Status: Connected

Next Steps:
1. Run app: flutter run -d ABCD1234
2. View logs: adb -s ABCD1234 logcat -s flutter
3. Debug: flutter attach -d ABCD1234
```

## Agent Reference

For Android platform details, consult the `flutter-android-platform` agent.
