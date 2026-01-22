# /flutter-accessibility

Audit and improve app accessibility for WCAG compliance and inclusive design.

## Usage

```
/flutter-accessibility [command] [options]
```

## Commands

- `audit`: Run accessibility audit on the codebase
- `fix`: Apply automatic fixes where possible
- `report`: Generate detailed accessibility report
- `test`: Run accessibility-focused tests

## Options

- `--level <A|AA|AAA>`: WCAG compliance level (default: AA)
- `--path <path>`: Target specific directory
- `--focus <area>`: Focus on specific area (semantics|contrast|touch|focus)
- `--verbose`: Show detailed findings

## Examples

```
/flutter-accessibility audit
/flutter-accessibility audit --level AAA
/flutter-accessibility fix --path lib/features/auth/
/flutter-accessibility report
/flutter-accessibility test
```

## Instructions

When the user invokes `/flutter-accessibility`, follow these steps:

### 1. Audit Categories

Check for accessibility issues in these categories:

```yaml
audit_categories:
  semantics:
    - Missing semantic labels
    - Incorrect semantic roles
    - Missing announcements for dynamic content

  contrast:
    - Text contrast ratios
    - Icon visibility
    - Focus indicator contrast

  touch_targets:
    - Minimum tap target size (48x48dp)
    - Adequate spacing between targets

  focus_management:
    - Keyboard navigation order
    - Focus visibility
    - Focus trapping in modals

  screen_readers:
    - Meaningful reading order
    - Live region announcements
    - Image descriptions
```

### 2. Semantic Labels Audit

Check for missing or improper semantics:

```dart
// BAD: No semantic information
IconButton(
  icon: Icon(Icons.delete),
  onPressed: _deleteItem,
)

// GOOD: With semantic label
IconButton(
  icon: Icon(Icons.delete),
  onPressed: _deleteItem,
  tooltip: 'Delete item',  // Provides semantic label
)

// Or with explicit Semantics
Semantics(
  button: true,
  label: 'Delete item',
  child: IconButton(
    icon: Icon(Icons.delete),
    onPressed: _deleteItem,
  ),
)
```

Common patterns to check:

```dart
// Images
Image.network(url)  // BAD
Image.network(url, semanticLabel: 'Product photo')  // GOOD

// Icons
Icon(Icons.home)  // BAD
Icon(Icons.home, semanticLabel: 'Home')  // GOOD

// Custom buttons
GestureDetector(onTap: _onTap, child: child)  // BAD
Semantics(
  button: true,
  label: 'Custom action',
  child: GestureDetector(onTap: _onTap, child: child),
)  // GOOD

// Decorative elements (should be excluded)
Semantics(
  excludeSemantics: true,
  child: DecorativeImage(),
)
```

### 3. Contrast Ratio Check

WCAG contrast requirements:

```yaml
contrast_requirements:
  level_AA:
    normal_text: 4.5:1  # 14pt regular, 18pt bold or smaller
    large_text: 3:1     # 18pt regular, 14pt bold or larger
    ui_components: 3:1  # Icons, borders, focus indicators

  level_AAA:
    normal_text: 7:1
    large_text: 4.5:1
```

```dart
// Check contrast programmatically
double calculateContrastRatio(Color foreground, Color background) {
  double l1 = foreground.computeLuminance();
  double l2 = background.computeLuminance();
  double lighter = max(l1, l2);
  double darker = min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Example usage
final ratio = calculateContrastRatio(Colors.grey, Colors.white);
// ratio = 1.32 - FAILS AA (needs 4.5:1 for normal text)
```

Recommended color combinations:

```dart
// GOOD contrast combinations
const goodCombinations = [
  // Dark text on light background
  ColorPair(text: Color(0xFF1A1A1A), background: Color(0xFFFFFFFF)), // 17.4:1
  ColorPair(text: Color(0xFF2D3436), background: Color(0xFFF5F5F5)), // 12.6:1

  // Light text on dark background
  ColorPair(text: Color(0xFFFFFFFF), background: Color(0xFF1A1A1A)), // 17.4:1
  ColorPair(text: Color(0xFFF5F5F5), background: Color(0xFF2D3436)), // 12.6:1
];
```

### 4. Touch Target Size

Minimum touch target: 48x48 density-independent pixels

```dart
// BAD: Touch target too small
IconButton(
  iconSize: 16,  // Icon is small, but touch target might be OK
  padding: EdgeInsets.zero,  // This makes touch target too small!
  icon: Icon(Icons.close),
  onPressed: _close,
)

// GOOD: Adequate touch target
IconButton(
  iconSize: 24,
  padding: EdgeInsets.all(12),  // 24 + 12*2 = 48dp
  icon: Icon(Icons.close),
  onPressed: _close,
)

// Or use constraints
ConstrainedBox(
  constraints: BoxConstraints(minWidth: 48, minHeight: 48),
  child: GestureDetector(
    onTap: _action,
    child: Icon(Icons.settings, size: 20),
  ),
)
```

### 5. Focus Management

```dart
// Proper focus order
class LoginForm extends StatefulWidget {
  @override
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _submitFocus = FocusNode();

  @override
  void dispose() {
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _submitFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      child: Column(
        children: [
          FocusTraversalOrder(
            order: NumericFocusOrder(1),
            child: TextField(
              focusNode: _emailFocus,
              decoration: InputDecoration(labelText: 'Email'),
              textInputAction: TextInputAction.next,
              onSubmitted: (_) => _passwordFocus.requestFocus(),
            ),
          ),
          FocusTraversalOrder(
            order: NumericFocusOrder(2),
            child: TextField(
              focusNode: _passwordFocus,
              decoration: InputDecoration(labelText: 'Password'),
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _submit(),
            ),
          ),
          FocusTraversalOrder(
            order: NumericFocusOrder(3),
            child: ElevatedButton(
              focusNode: _submitFocus,
              onPressed: _submit,
              child: Text('Login'),
            ),
          ),
        ],
      ),
    );
  }
}
```

### 6. Screen Reader Announcements

```dart
// Announce dynamic changes
void _showSuccess() {
  SemanticsService.announce(
    'Item successfully added to cart',
    TextDirection.ltr,
  );
}

// Live regions for updates
class NotificationBanner extends StatelessWidget {
  final String message;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Container(
        child: Text(message),
      ),
    );
  }
}

// Modal announcements
showDialog(
  context: context,
  builder: (context) => Semantics(
    scopesRoute: true,
    namesRoute: true,
    label: 'Confirmation dialog',
    child: AlertDialog(
      title: Text('Confirm Action'),
      content: Text('Are you sure?'),
      actions: [...],
    ),
  ),
);
```

### 7. Accessibility Testing

```dart
// Widget test with accessibility checks
testWidgets('meets accessibility guidelines', (tester) async {
  final handle = tester.ensureSemantics();

  await tester.pumpWidget(MaterialApp(home: MyWidget()));

  // Check tap target size (48x48)
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));

  // Check that all tappable items have labels
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));

  // Check text contrast
  await expectLater(tester, meetsGuideline(textContrastGuideline));

  handle.dispose();
});

// Custom semantic matcher
expect(
  find.byType(CustomButton),
  matchesSemantics(
    label: 'Submit form',
    isButton: true,
    hasTapAction: true,
  ),
);
```

### 8. Common Fixes

#### Add Semantic Labels

```dart
// Fix: Add tooltips to icon buttons
class AccessibleIconButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const AccessibleIconButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: label,
      child: IconButton(
        icon: Icon(icon, semanticLabel: label),
        onPressed: onPressed,
      ),
    );
  }
}
```

#### Fix Contrast Issues

```dart
// Fix: Use theme-aware colors
class AccessibleText extends StatelessWidget {
  final String text;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Use semantic colors that guarantee contrast
    return Text(
      text,
      style: TextStyle(
        color: colorScheme.onSurface,  // Guaranteed contrast on surface
      ),
    );
  }
}
```

#### Fix Touch Targets

```dart
// Fix: Wrap small widgets
class AccessibleTapTarget extends StatelessWidget {
  final Widget child;
  final VoidCallback onTap;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticLabel,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minWidth: 48,
            minHeight: 48,
          ),
          child: Center(child: child),
        ),
      ),
    );
  }
}
```

### 9. Generate Report

```
Accessibility Audit Report
==========================

Compliance Level: WCAG 2.1 AA
Files Scanned: 87
Issues Found: 23

Critical Issues (8)
-------------------
1. lib/features/auth/pages/login_page.dart:45
   - Missing semantic label on submit button
   - Severity: HIGH

2. lib/shared/widgets/icon_button.dart:12
   - Touch target size: 32x32 (required: 48x48)
   - Severity: HIGH

3. lib/core/theme/colors.dart:15
   - Contrast ratio 2.8:1 (required: 4.5:1)
   - Affected: Secondary text color
   - Severity: HIGH

Warnings (10)
-------------
4. lib/features/home/widgets/product_card.dart:28
   - Image missing semanticLabel
   - Recommendation: Add descriptive label

5. lib/shared/widgets/custom_button.dart:56
   - No focus indicator override
   - Recommendation: Ensure visible focus state

Passed Checks
-------------
✓ 156 widgets have proper semantic labels
✓ 89 interactive elements meet tap target guidelines
✓ Focus traversal order is logical
✓ Modal dialogs have proper routing semantics

Recommendations
---------------
1. Add semantic labels to all interactive elements
2. Review color palette for contrast compliance
3. Implement minimum tap targets of 48x48dp
4. Test with screen reader (TalkBack/VoiceOver)

Next Steps
----------
Run `/flutter-accessibility fix` to apply automatic fixes.
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Flutter Accessibility](https://docs.flutter.dev/development/accessibility-and-localization/accessibility)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)

## Agent Reference

For widget development with accessibility, consult the `flutter-widget-builder` agent.
