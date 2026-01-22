# /flutter-i18n

Set up and manage internationalization (i18n/l10n) in Flutter projects.

## Usage

```
/flutter-i18n [command] [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize localization with flutter gen-l10n |
| `add-locale <code>` | Add new locale (e.g., es, fr, ko, zh-Hans) |
| `generate` | Run flutter gen-l10n to regenerate localization classes |
| `sync` | Sync missing keys across all locale ARB files |
| `list` | List all configured locales |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--arb-dir <path>` | ARB files directory | `lib/l10n` |
| `--output-dir <path>` | Generated files output directory | `lib/l10n/generated` |
| `--template-arb <file>` | Template ARB locale file | `app_en.arb` |
| `--output-class <name>` | Generated class name | `AppLocalizations` |
| `--deferred` | Enable deferred loading for web | `false` |
| `--nullable-getter` | Use nullable getter pattern | `true` |

## Examples

```bash
# Initialize localization in a new project
/flutter-i18n init

# Add Spanish locale
/flutter-i18n add-locale es

# Add Korean locale
/flutter-i18n add-locale ko

# Add Chinese (Simplified) locale
/flutter-i18n add-locale zh-Hans

# Regenerate localization classes
/flutter-i18n generate

# Sync missing keys across all locales
/flutter-i18n sync

# Initialize with custom settings
/flutter-i18n init --arb-dir lib/locales --output-class L10n
```

## Initialization Steps

When running `/flutter-i18n init`, the skill performs:

### 1. Add Dependencies to pubspec.yaml

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.20.2

flutter:
  generate: true
```

### 2. Create l10n.yaml Configuration

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
preferred-supported-locales: [en]
nullable-getter: true
use-escaping: true
use-deferred-loading: false
untranslated-messages-file: lib/l10n/untranslated.txt
```

### 3. Create Template ARB File (lib/l10n/app_en.arb)

```json
{
  "@@locale": "en",
  "appTitle": "My Application",
  "@appTitle": {
    "description": "The title of the application"
  },
  "hello": "Hello {userName}",
  "@hello": {
    "description": "Greeting with user name",
    "placeholders": {
      "userName": {
        "type": "String",
        "example": "John"
      }
    }
  }
}
```

### 4. Configure MaterialApp

```dart
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  localeResolutionCallback: (locale, supportedLocales) {
    for (var supportedLocale in supportedLocales) {
      if (supportedLocale.languageCode == locale?.languageCode) {
        return supportedLocale;
      }
    }
    return supportedLocales.first;
  },
);
```

### 5. Run Generation

```bash
flutter gen-l10n
```

## ARB Message Format

### Basic Strings
```json
{
  "welcomeMessage": "Welcome to our app!",
  "@welcomeMessage": {
    "description": "Welcome message shown on home screen"
  }
}
```

### Placeholders
```json
{
  "hello": "Hello {userName}",
  "@hello": {
    "description": "Greeting with user name",
    "placeholders": {
      "userName": {
        "type": "String",
        "example": "John"
      }
    }
  }
}
```

### Pluralization
```json
{
  "itemCount": "{count, plural, =0{No items} =1{1 item} other{{count} items}}",
  "@itemCount": {
    "description": "Item count with pluralization",
    "placeholders": {
      "count": {
        "type": "int"
      }
    }
  }
}
```

### Gender/Select
```json
{
  "gender": "{gender, select, male{He} female{She} other{They}} liked this",
  "@gender": {
    "description": "Gender-aware message",
    "placeholders": {
      "gender": {
        "type": "String"
      }
    }
  }
}
```

### Number Formatting
```json
{
  "price": "Price: {amount}",
  "@price": {
    "placeholders": {
      "amount": {
        "type": "double",
        "format": "currency",
        "optionalParameters": {
          "symbol": "$",
          "decimalDigits": 2
        }
      }
    }
  },
  "percentage": "Completed: {value}",
  "@percentage": {
    "placeholders": {
      "value": {
        "type": "double",
        "format": "percentPattern"
      }
    }
  }
}
```

### Date Formatting
```json
{
  "today": "Today is {date}",
  "@today": {
    "placeholders": {
      "date": {
        "type": "DateTime",
        "format": "yMMMd"
      }
    }
  },
  "eventTime": "Event starts at {time}",
  "@eventTime": {
    "placeholders": {
      "time": {
        "type": "DateTime",
        "format": "jm"
      }
    }
  }
}
```

## Usage in Code

```dart
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// In a widget
Text(AppLocalizations.of(context)!.hello('John'));
Text(AppLocalizations.of(context)!.itemCount(5));
Text(AppLocalizations.of(context)!.price(99.99));
Text(AppLocalizations.of(context)!.today(DateTime.now()));

// With extension (recommended)
// Create an extension for cleaner access
extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this)!;
}

// Usage
Text(context.l10n.hello('John'));
```

## intl Package Formatters

```dart
import 'package:intl/intl.dart';

// Date formatting
DateFormat.yMMMd().format(DateTime.now());  // "Jan 15, 2026"
DateFormat('EEEE, MMMM d').format(date);    // "Wednesday, January 15"
DateFormat.Hm().format(time);               // "14:30"

// Number formatting
NumberFormat.compact().format(1234567);           // "1.2M"
NumberFormat.currency(symbol: '\$').format(99.99); // "$99.99"
NumberFormat.percentPattern().format(0.42);       // "42%"
NumberFormat.decimalPattern().format(12345.67);   // "12,345.67"

// Bidirectional text utilities
Bidi.stripHtmlIfNeeded(text);
Bidi.detectRtlDirectionality(text);
```

## Adding a New Locale

When running `/flutter-i18n add-locale ko`:

1. Creates `lib/l10n/app_ko.arb` with all keys from template
2. Adds Korean to supported locales
3. Runs `flutter gen-l10n`

## RTL Language Support

For RTL languages (Arabic, Hebrew, etc.):

```dart
// Detect and handle RTL
Directionality(
  textDirection: Bidi.isRtlLanguage(locale.languageCode)
    ? TextDirection.rtl
    : TextDirection.ltr,
  child: MyWidget(),
)

// Or use Localizations.localeOf
final locale = Localizations.localeOf(context);
final isRtl = Bidi.isRtlLanguage(locale.languageCode);
```

## Testing Localized Content

```dart
testWidgets('shows localized greeting', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: const Locale('es'),
      home: MyWidget(),
    ),
  );

  expect(find.text('Hola John'), findsOneWidget);
});

// Or use Localizations.override for specific tests
Localizations.override(
  context: context,
  locale: const Locale('fr'),
  child: MyWidget(),
)
```

## Multi-Script Languages

For languages with multiple scripts:

```
zh-Hans  - Chinese (Simplified)
zh-Hant  - Chinese (Traditional)
sr-Latn  - Serbian (Latin)
sr-Cyrl  - Serbian (Cyrillic)
```

Create separate ARB files:
- `app_zh_Hans.arb`
- `app_zh_Hant.arb`

## iOS Configuration

For iOS, also update `ios/Runner/Info.plist`:

```xml
<key>CFBundleLocalizations</key>
<array>
  <string>en</string>
  <string>es</string>
  <string>ko</string>
</array>
```

## Best Practices

1. **Always add @description**: Helps translators understand context
2. **Use meaningful key names**: `loginButtonLabel` not `text1`
3. **Include examples for placeholders**: Aids translation accuracy
4. **Keep strings in ARB files**: Never hardcode user-facing text
5. **Test all locales**: Ensure layouts work with different text lengths
6. **Handle missing translations gracefully**: Configure fallback locale

## Related

- `flutter-i18n-expert` agent - Detailed i18n patterns and best practices
- [Flutter Internationalization Docs](https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization)
