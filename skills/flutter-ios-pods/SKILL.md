# /flutter-ios-pods

Manage CocoaPods dependencies for iOS Flutter projects.

## Usage

```
/flutter-ios-pods [command] [options]
```

## Commands

- `install`: Install pods from Podfile
- `update`: Update pods to latest versions
- `clean`: Clean pod cache and reinstall
- `add <pod>`: Add a new pod to Podfile
- `remove <pod>`: Remove a pod from Podfile
- `outdated`: Show outdated pods
- `repo-update`: Update CocoaPods spec repos

## Options

- `--verbose`: Show detailed output
- `--no-repo-update`: Skip repository update

## Examples

```
/flutter-ios-pods install
/flutter-ios-pods update
/flutter-ios-pods clean
/flutter-ios-pods add Firebase/Analytics
/flutter-ios-pods outdated
```

## Instructions

When the user invokes `/flutter-ios-pods`, follow these steps:

### 1. Verify CocoaPods Installation

```bash
# Check CocoaPods version
pod --version

# Install if not present
sudo gem install cocoapods

# Or via Homebrew
brew install cocoapods

# Setup CocoaPods
pod setup
```

### 2. Install Pods

```bash
cd ios

# Standard install
pod install

# With repo update
pod install --repo-update

# Verbose output
pod install --verbose

# After install, always use .xcworkspace
# open Runner.xcworkspace
```

### 3. Update Pods

```bash
cd ios

# Update all pods
pod update

# Update specific pod
pod update Firebase

# Update with verbose output
pod update --verbose
```

### 4. Clean and Reinstall

```bash
cd ios

# Remove Pods directory and lock file
rm -rf Pods
rm -f Podfile.lock

# Clear CocoaPods cache
pod cache clean --all

# Reinstall
pod install --repo-update
```

### 5. Add Pod to Podfile

```ruby
# ios/Podfile
target 'Runner' do
  use_frameworks!
  use_modular_headers!

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))

  # Add new pods here
  pod 'Firebase/Analytics'
  pod 'Firebase/Crashlytics'
  pod 'Firebase/Messaging'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
  end
end
```

```bash
# After editing Podfile
pod install
```

### 6. Remove Pod

```ruby
# Remove the pod line from Podfile
# pod 'PodToRemove'  # Delete this line
```

```bash
# Then run install to update
pod install
```

### 7. Check Outdated Pods

```bash
cd ios

# List outdated pods
pod outdated

# Output shows:
# - Current version
# - Available version
# - Latest version
```

### 8. Update Spec Repos

```bash
# Update all spec repositories
pod repo update

# Update specific repo
pod repo update trunk

# Remove and re-add trunk
pod repo remove trunk
pod setup
```

### 9. Podfile Configuration

```ruby
# ios/Podfile

# Set minimum iOS version
platform :ios, '12.0'

# Disable CocoaPods analytics
ENV['COCOAPODS_DISABLE_STATS'] = 'true'

# Project configurations
project 'Runner', {
  'Debug' => :debug,
  'Profile' => :release,
  'Release' => :release,
}

# Flutter root helper
def flutter_root
  generated_xcode_build_settings_path = File.expand_path(File.join('..', 'Flutter', 'Generated.xcconfig'), __FILE__)
  unless File.exist?(generated_xcode_build_settings_path)
    raise "#{generated_xcode_build_settings_path} must exist. Run flutter pub get first"
  end

  File.foreach(generated_xcode_build_settings_path) do |line|
    matches = line.match(/FLUTTER_ROOT\=(.*)/)
    return matches[1].strip if matches
  end
  raise "FLUTTER_ROOT not found"
end

require File.expand_path(File.join('packages', 'flutter_tools', 'bin', 'podhelper'), flutter_root)

flutter_ios_podfile_setup

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))

  # Third-party pods
  # pod 'Firebase/Core'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)

    # Fix deployment target warnings
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
    end
  end
end
```

### 10. Troubleshooting Common Issues

#### CDN Source Issues

```bash
# If CDN has issues, use git source
# In Podfile, add at top:
source 'https://github.com/CocoaPods/Specs.git'

# Or remove CDN and use git
pod repo remove trunk
pod repo add trunk https://github.com/CocoaPods/Specs.git
```

#### Architecture Issues (Apple Silicon)

```bash
# For M1/M2 Macs, ensure arm64 simulator support
# In Podfile post_install:
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = ''
    end
  end
end
```

#### Version Conflicts

```bash
# Check pod dependencies
pod dependencies

# Check why a specific version is needed
pod update PodName --verbose

# Lock specific version in Podfile
pod 'Firebase/Analytics', '~> 10.0'
```

#### Permission Errors

```bash
# Fix ownership issues
sudo chown -R $(whoami) ~/.cocoapods

# Fix gem permissions
sudo gem install cocoapods --user-install
```

#### Slow Install

```bash
# Skip repo update
pod install --no-repo-update

# Use verbose to see what's slow
pod install --verbose
```

### 11. Pod Specifications

```ruby
# Version specifiers
pod 'Alamofire'              # Latest version
pod 'Alamofire', '5.9.0'     # Exact version
pod 'Alamofire', '~> 5.9'    # >= 5.9.0, < 6.0.0
pod 'Alamofire', '>= 5.9'    # >= 5.9.0
pod 'Alamofire', '< 6.0'     # < 6.0.0

# Git sources
pod 'Alamofire', :git => 'https://github.com/Alamofire/Alamofire.git'
pod 'Alamofire', :git => 'https://github.com/Alamofire/Alamofire.git', :branch => 'dev'
pod 'Alamofire', :git => 'https://github.com/Alamofire/Alamofire.git', :tag => '5.9.0'
pod 'Alamofire', :git => 'https://github.com/Alamofire/Alamofire.git', :commit => 'abc123'

# Local path
pod 'MyPod', :path => '../MyPod'

# Subspecs
pod 'Firebase/Analytics'
pod 'Firebase/Crashlytics'
```

### 12. Output Summary

```
CocoaPods Management Complete
=============================

Action: {{action}}
Directory: ios/

Pods Installed:
- flutter_local_notifications (17.0.0)
- firebase_core (2.24.2)
- firebase_analytics (10.8.0)

Pod Changes:
+ Added: firebase_messaging (14.7.10)
- Removed: old_pod (1.0.0)
~ Updated: firebase_core (2.24.1 -> 2.24.2)

Podfile.lock: Updated
Pods/: Synced

Next Steps:
1. Open Runner.xcworkspace (not .xcodeproj)
2. Build project: flutter build ios
3. If issues persist: /flutter-ios-pods clean
```

## Agent Reference

For iOS platform details, consult the `flutter-ios-platform` agent.
