# /flutter-windows-package

Create Windows distribution packages (MSIX, EXE installer).

## Usage

```
/flutter-windows-package [format] [options]
```

## Formats

- `msix`: Create MSIX package
- `exe`: Create traditional installer (Inno Setup)
- `zip`: Create portable ZIP archive

## Options

- `--sign`: Sign with code signing certificate
- `--store`: Prepare for Windows Store
- `--certificate <path>`: Path to PFX certificate

## Examples

```
/flutter-windows-package msix
/flutter-windows-package exe
/flutter-windows-package msix --store
/flutter-windows-package msix --sign --certificate cert.pfx
```

## Instructions

When the user invokes `/flutter-windows-package`, follow these steps:

### 1. Build Release

```bash
# Build Windows release
flutter build windows --release

# Output: build/windows/x64/runner/Release/
```

### 2. Configure MSIX

```yaml
# pubspec.yaml
dev_dependencies:
  msix: ^3.16.0

msix_config:
  display_name: MyApp
  publisher_display_name: Your Company
  identity_name: com.example.myapp
  msix_version: 1.0.0.0
  publisher: CN=Your Company, O=Your Company, L=City, S=State, C=US
  logo_path: assets/icons/app_icon.png
  start_menu_icon_path: assets/icons/app_icon.png
  tile_icon_path: assets/icons/app_icon.png
  icons_background_color: transparent
  architecture: x64
  capabilities: internetClient, microphone, webcam
  languages: en-us
  file_extension: .myapp
  protocol_activation: myapp
  store: false
```

### 3. Create MSIX Package

```bash
# Create MSIX
dart run msix:create

# Create for Windows Store
dart run msix:create --store

# Output: build/windows/x64/runner/Release/myapp.msix
```

### 4. Sign MSIX (Non-Store)

#### Create Self-Signed Certificate

```powershell
# Create certificate
$cert = New-SelfSignedCertificate `
  -Type Custom `
  -Subject "CN=Your Company, O=Your Company, L=City, S=State, C=US" `
  -KeyUsage DigitalSignature `
  -FriendlyName "MyApp Code Signing" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

# Export as PFX
$password = ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "certificate.pfx" -Password $password

# Export public certificate (for installation)
Export-Certificate -Cert $cert -FilePath "certificate.cer"
```

#### Sign Package

```yaml
# pubspec.yaml msix_config (add)
msix_config:
  # ... other config ...
  certificate_path: certificate.pfx
  certificate_password: YourPassword
```

```bash
# Or sign manually
signtool sign /fd SHA256 /a /f certificate.pfx /p YourPassword `
  build/windows/x64/runner/Release/myapp.msix
```

### 5. Create Inno Setup Installer

```iss
; setup.iss
#define MyAppName "MyApp"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Your Company"
#define MyAppURL "https://example.com"
#define MyAppExeName "myapp.exe"

[Setup]
AppId={{YOUR-APP-GUID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=build\windows\installer
OutputBaseFilename={#MyAppName}-{#MyAppVersion}-Setup
SetupIconFile=windows\runner\resources\app_icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
```

```bash
# Build with Inno Setup
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup.iss
```

### 6. Create Portable ZIP

```powershell
# Create ZIP archive
Compress-Archive `
  -Path "build\windows\x64\runner\Release\*" `
  -DestinationPath "build\windows\MyApp-1.0.0-portable.zip"
```

### 7. Windows Store Submission

```yaml
# pubspec.yaml msix_config for Store
msix_config:
  display_name: MyApp
  publisher_display_name: Your Company
  identity_name: 12345YourCompany.MyApp  # From Partner Center
  msix_version: 1.0.0.0
  publisher: CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  # From Partner Center
  store: true
  # No certificate needed for store submission
```

```bash
# Create store package
dart run msix:create --store

# Upload to Partner Center
# https://partner.microsoft.com/dashboard
```

### 8. Code Signing with Commercial Certificate

```powershell
# Sign with commercial certificate
signtool sign /fd SHA256 /f "certificate.pfx" /p "password" `
  /tr http://timestamp.digicert.com /td SHA256 `
  "build\windows\x64\runner\Release\myapp.exe"

# Sign all DLLs
Get-ChildItem "build\windows\x64\runner\Release\*.dll" | ForEach-Object {
  signtool sign /fd SHA256 /f "certificate.pfx" /p "password" `
    /tr http://timestamp.digicert.com /td SHA256 `
    $_.FullName
}

# Sign MSIX
signtool sign /fd SHA256 /f "certificate.pfx" /p "password" `
  /tr http://timestamp.digicert.com /td SHA256 `
  "build\windows\x64\runner\Release\myapp.msix"
```

### 9. Verify Signature

```powershell
# Verify EXE signature
signtool verify /pa /v "build\windows\x64\runner\Release\myapp.exe"

# Check MSIX signature
# Right-click MSIX → Properties → Digital Signatures

# Or via PowerShell
Get-AuthenticodeSignature "build\windows\x64\runner\Release\myapp.exe"
```

### 10. Installation Testing

```powershell
# Install MSIX (requires certificate trust)
Add-AppxPackage -Path "myapp.msix"

# Install certificate first (self-signed)
Import-Certificate -FilePath "certificate.cer" `
  -CertStoreLocation "Cert:\LocalMachine\TrustedPeople"

# Then install MSIX
Add-AppxPackage -Path "myapp.msix"

# List installed packages
Get-AppxPackage | Where-Object {$_.Name -like "*myapp*"}

# Uninstall
Get-AppxPackage *myapp* | Remove-AppxPackage
```

### 11. Automated Build Script

```powershell
# scripts/build_windows.ps1

$AppName = "MyApp"
$Version = "1.0.0"

Write-Host "Building Windows release..."
flutter build windows --release

Write-Host "Creating MSIX..."
dart run msix:create

Write-Host "Creating installer..."
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup.iss

Write-Host "Creating portable ZIP..."
Compress-Archive `
  -Path "build\windows\x64\runner\Release\*" `
  -DestinationPath "build\windows\$AppName-$Version-portable.zip" `
  -Force

Write-Host "Build complete!"
Write-Host "Packages created:"
Write-Host "  - build\windows\x64\runner\Release\$AppName.msix"
Write-Host "  - build\windows\installer\$AppName-$Version-Setup.exe"
Write-Host "  - build\windows\$AppName-$Version-portable.zip"
```

### 12. Troubleshooting

```powershell
# MSIX installation fails
# Check if certificate is trusted
certutil -verify certificate.cer

# Install certificate to trusted store
Import-Certificate -FilePath "certificate.cer" `
  -CertStoreLocation "Cert:\LocalMachine\TrustedPeople"

# Or enable Developer Mode
# Settings → For Developers → Developer Mode

# Signing errors
signtool sign /debug /fd SHA256 /f cert.pfx /p password app.exe

# Build errors
flutter clean
flutter build windows --release

# Check Visual Studio installation
# Must have "Desktop development with C++"
```

### 13. Output Summary

```
Windows Package Created
=======================

App: MyApp
Version: 1.0.0

Build:
- Architecture: x64
- Configuration: Release
- Signed: Yes

Packages Created:
- MSIX: build/windows/x64/runner/Release/MyApp.msix (32 MB)
- Installer: build/windows/installer/MyApp-1.0.0-Setup.exe (28 MB)
- Portable: build/windows/MyApp-1.0.0-portable.zip (30 MB)

Signature:
- Publisher: CN=Your Company
- Timestamp: DigiCert
- Algorithm: SHA256

Distribution Options:
- Windows Store: Upload MSIX to Partner Center
- Website: Provide installer or MSIX
- Enterprise: Use MSIX with certificate

Next Steps:
1. Test installation on clean Windows
2. Submit to Windows Store (if applicable)
3. Update download links
```

## Agent Reference

For Windows platform details, consult the `flutter-windows-platform` agent.
