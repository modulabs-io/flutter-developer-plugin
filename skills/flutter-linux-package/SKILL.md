# /flutter-linux-package

Create Linux distribution packages (Snap, Flatpak, AppImage, deb, rpm).

## Usage

```
/flutter-linux-package [format] [options]
```

## Formats

- `snap`: Create Snap package
- `flatpak`: Create Flatpak package
- `appimage`: Create AppImage
- `deb`: Create Debian package
- `rpm`: Create RPM package
- `tar`: Create tarball

## Options

- `--publish`: Publish to store (Snap Store/Flathub)
- `--arch <arch>`: Target architecture (amd64, arm64)

## Examples

```
/flutter-linux-package snap
/flutter-linux-package flatpak
/flutter-linux-package appimage
/flutter-linux-package deb
/flutter-linux-package snap --publish
```

## Instructions

When the user invokes `/flutter-linux-package`, follow these steps:

### 1. Build Release

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev

# Build release
flutter build linux --release

# Output: build/linux/x64/release/bundle/
```

### 2. Create Snap Package

#### snapcraft.yaml

```yaml
# snap/snapcraft.yaml
name: myapp
base: core22
version: '1.0.0'
summary: A Flutter application
description: |
  MyApp is a cross-platform application built with Flutter.

grade: stable
confinement: strict

architectures:
  - build-on: amd64

apps:
  myapp:
    command: myapp
    extensions: [gnome]
    plugs:
      - home
      - network
      - network-bind
      - audio-playback
      - camera
      - opengl
    desktop: usr/share/applications/myapp.desktop

parts:
  myapp:
    plugin: nil
    source: .
    build-snaps:
      - flutter/latest/stable
    build-packages:
      - clang
      - cmake
      - ninja-build
      - pkg-config
      - libgtk-3-dev
      - liblzma-dev
    stage-packages:
      - libgtk-3-0
    override-build: |
      set -eux
      flutter config --enable-linux-desktop
      flutter pub get
      flutter build linux --release
      mkdir -p $SNAPCRAFT_PART_INSTALL/bin
      mkdir -p $SNAPCRAFT_PART_INSTALL/lib
      mkdir -p $SNAPCRAFT_PART_INSTALL/usr/share/applications
      mkdir -p $SNAPCRAFT_PART_INSTALL/usr/share/icons/hicolor/256x256/apps
      cp -r build/linux/x64/release/bundle/* $SNAPCRAFT_PART_INSTALL/
      cp linux/packaging/myapp.desktop $SNAPCRAFT_PART_INSTALL/usr/share/applications/
      cp linux/packaging/myapp.png $SNAPCRAFT_PART_INSTALL/usr/share/icons/hicolor/256x256/apps/
```

#### Build Snap

```bash
# Install snapcraft
sudo snap install snapcraft --classic

# Build
snapcraft

# Install locally
sudo snap install myapp_1.0.0_amd64.snap --dangerous

# Publish to Snap Store
snapcraft login
snapcraft upload myapp_1.0.0_amd64.snap
snapcraft release myapp 1 stable
```

### 3. Create Flatpak Package

#### com.example.myapp.yml

```yaml
# flatpak/com.example.myapp.yml
app-id: com.example.myapp
runtime: org.gnome.Platform
runtime-version: '45'
sdk: org.gnome.Sdk
command: myapp

finish-args:
  - --share=ipc
  - --share=network
  - --socket=fallback-x11
  - --socket=wayland
  - --socket=pulseaudio
  - --device=dri
  - --filesystem=home

modules:
  - name: myapp
    buildsystem: simple
    build-commands:
      - mkdir -p /app/bin /app/lib
      - cp -r bundle/* /app/
      - chmod +x /app/myapp
      - mkdir -p /app/share/applications
      - mkdir -p /app/share/icons/hicolor/256x256/apps
      - mkdir -p /app/share/metainfo
      - cp myapp.desktop /app/share/applications/com.example.myapp.desktop
      - cp myapp.png /app/share/icons/hicolor/256x256/apps/com.example.myapp.png
      - cp com.example.myapp.metainfo.xml /app/share/metainfo/
    sources:
      - type: dir
        path: ../build/linux/x64/release/bundle
      - type: file
        path: ../linux/packaging/myapp.desktop
      - type: file
        path: ../linux/packaging/myapp.png
      - type: file
        path: ../linux/packaging/com.example.myapp.metainfo.xml
```

#### Build Flatpak

```bash
# Install dependencies
sudo apt install flatpak-builder

# Add Flathub
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install SDK
flatpak install flathub org.gnome.Platform//45 org.gnome.Sdk//45

# Build Flutter first
flutter build linux --release

# Build Flatpak
flatpak-builder --force-clean build-dir flatpak/com.example.myapp.yml

# Install locally
flatpak-builder --user --install --force-clean build-dir flatpak/com.example.myapp.yml

# Create bundle
flatpak-builder --repo=repo --force-clean build-dir flatpak/com.example.myapp.yml
flatpak build-bundle repo myapp.flatpak com.example.myapp
```

### 4. Create AppImage

#### Setup AppDir

```bash
# Build Flutter
flutter build linux --release

# Create AppDir structure
mkdir -p AppDir/usr/bin
mkdir -p AppDir/usr/lib
mkdir -p AppDir/usr/share/applications
mkdir -p AppDir/usr/share/icons/hicolor/256x256/apps

# Copy files
cp -r build/linux/x64/release/bundle/* AppDir/usr/bin/
cp linux/packaging/myapp.desktop AppDir/
cp linux/packaging/myapp.png AppDir/

# Create AppRun
cat > AppDir/AppRun << 'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export LD_LIBRARY_PATH="${HERE}/usr/bin/lib:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/myapp" "$@"
EOF
chmod +x AppDir/AppRun

# Download appimagetool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

# Create AppImage
./appimagetool-x86_64.AppImage AppDir MyApp-x86_64.AppImage
```

### 5. Create DEB Package

```bash
# Build Flutter
flutter build linux --release

# Create package structure
PKG_NAME="myapp"
PKG_VERSION="1.0.0"
PKG_DIR="${PKG_NAME}_${PKG_VERSION}-1_amd64"

mkdir -p "${PKG_DIR}/DEBIAN"
mkdir -p "${PKG_DIR}/usr/bin"
mkdir -p "${PKG_DIR}/usr/lib/${PKG_NAME}"
mkdir -p "${PKG_DIR}/usr/share/applications"
mkdir -p "${PKG_DIR}/usr/share/icons/hicolor/256x256/apps"

# Copy files
cp -r build/linux/x64/release/bundle/* "${PKG_DIR}/usr/lib/${PKG_NAME}/"
ln -sf "../lib/${PKG_NAME}/${PKG_NAME}" "${PKG_DIR}/usr/bin/${PKG_NAME}"
cp linux/packaging/myapp.desktop "${PKG_DIR}/usr/share/applications/"
cp linux/packaging/myapp.png "${PKG_DIR}/usr/share/icons/hicolor/256x256/apps/"

# Create control file
cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: ${PKG_NAME}
Version: ${PKG_VERSION}-1
Section: utils
Priority: optional
Architecture: amd64
Depends: libgtk-3-0
Maintainer: Your Name <your@email.com>
Description: A Flutter application
 MyApp is a cross-platform application built with Flutter.
EOF

# Create postinst
cat > "${PKG_DIR}/DEBIAN/postinst" << 'EOF'
#!/bin/bash
update-desktop-database || true
gtk-update-icon-cache /usr/share/icons/hicolor || true
EOF
chmod +x "${PKG_DIR}/DEBIAN/postinst"

# Build package
dpkg-deb --build "${PKG_DIR}"

# Install
sudo dpkg -i "${PKG_DIR}.deb"
```

### 6. Create RPM Package

```bash
# Install rpm tools
sudo dnf install rpm-build rpmdevtools

# Setup directories
rpmdev-setuptree

# Build Flutter
flutter build linux --release

# Create tarball
mkdir -p myapp-1.0.0
cp -r build/linux/x64/release/bundle myapp-1.0.0/
cp linux/packaging/myapp.desktop myapp-1.0.0/
cp linux/packaging/myapp.png myapp-1.0.0/
tar czvf myapp-1.0.0.tar.gz myapp-1.0.0

# Copy to SOURCES
cp myapp-1.0.0.tar.gz ~/rpmbuild/SOURCES/

# Create spec file
cat > ~/rpmbuild/SPECS/myapp.spec << 'EOF'
Name:           myapp
Version:        1.0.0
Release:        1%{?dist}
Summary:        A Flutter application

License:        MIT
URL:            https://example.com
Source0:        %{name}-%{version}.tar.gz

Requires:       gtk3

%description
MyApp is a cross-platform application built with Flutter.

%prep
%setup -q

%install
mkdir -p %{buildroot}/usr/bin
mkdir -p %{buildroot}/usr/lib/%{name}
mkdir -p %{buildroot}/usr/share/applications
mkdir -p %{buildroot}/usr/share/icons/hicolor/256x256/apps

cp -r bundle/* %{buildroot}/usr/lib/%{name}/
ln -sf ../lib/%{name}/%{name} %{buildroot}/usr/bin/%{name}
cp %{name}.desktop %{buildroot}/usr/share/applications/
cp %{name}.png %{buildroot}/usr/share/icons/hicolor/256x256/apps/

%files
/usr/bin/%{name}
/usr/lib/%{name}/*
/usr/share/applications/%{name}.desktop
/usr/share/icons/hicolor/256x256/apps/%{name}.png

%changelog
* Wed Jan 01 2025 Your Name <your@email.com> - 1.0.0-1
- Initial release
EOF

# Build RPM
rpmbuild -ba ~/rpmbuild/SPECS/myapp.spec

# Output: ~/rpmbuild/RPMS/x86_64/myapp-1.0.0-1.x86_64.rpm
```

### 7. Create Tarball

```bash
# Build Flutter
flutter build linux --release

# Create tarball
tar czvf myapp-1.0.0-linux-x64.tar.gz \
  -C build/linux/x64/release/bundle .

# With additional files
mkdir -p myapp-1.0.0
cp -r build/linux/x64/release/bundle/* myapp-1.0.0/
cp linux/packaging/myapp.desktop myapp-1.0.0/
cp README.md myapp-1.0.0/
tar czvf myapp-1.0.0-linux-x64.tar.gz myapp-1.0.0
```

### 8. Desktop Entry File

```desktop
# linux/packaging/myapp.desktop
[Desktop Entry]
Name=MyApp
GenericName=Application
Comment=A Flutter application
Exec=myapp %U
Icon=myapp
Terminal=false
Type=Application
Categories=Utility;Application;
Keywords=flutter;app;
StartupNotify=true
StartupWMClass=myapp
MimeType=x-scheme-handler/myapp;
```

### 9. Metainfo File

```xml
<!-- linux/packaging/com.example.myapp.metainfo.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>com.example.myapp</id>
  <name>MyApp</name>
  <summary>A Flutter application</summary>
  <metadata_license>MIT</metadata_license>
  <project_license>MIT</project_license>
  <description>
    <p>MyApp is a cross-platform application built with Flutter.</p>
  </description>
  <launchable type="desktop-id">myapp.desktop</launchable>
  <url type="homepage">https://example.com</url>
  <developer_name>Your Company</developer_name>
  <releases>
    <release version="1.0.0" date="2025-01-01"/>
  </releases>
  <content_rating type="oars-1.1"/>
</component>
```

### 10. Automated Build Script

```bash
#!/bin/bash
# scripts/build_linux.sh

set -e

APP_NAME="myapp"
VERSION="1.0.0"

echo "Building Flutter release..."
flutter build linux --release

echo "Creating tarball..."
tar czvf "${APP_NAME}-${VERSION}-linux-x64.tar.gz" \
  -C build/linux/x64/release/bundle .

echo "Creating DEB package..."
PKG_DIR="${APP_NAME}_${VERSION}-1_amd64"
mkdir -p "${PKG_DIR}/DEBIAN"
mkdir -p "${PKG_DIR}/usr/lib/${APP_NAME}"
mkdir -p "${PKG_DIR}/usr/bin"
mkdir -p "${PKG_DIR}/usr/share/applications"
mkdir -p "${PKG_DIR}/usr/share/icons/hicolor/256x256/apps"

cp -r build/linux/x64/release/bundle/* "${PKG_DIR}/usr/lib/${APP_NAME}/"
ln -sf "../lib/${APP_NAME}/${APP_NAME}" "${PKG_DIR}/usr/bin/${APP_NAME}"
cp linux/packaging/myapp.desktop "${PKG_DIR}/usr/share/applications/"
cp linux/packaging/myapp.png "${PKG_DIR}/usr/share/icons/hicolor/256x256/apps/"

cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: ${APP_NAME}
Version: ${VERSION}-1
Architecture: amd64
Depends: libgtk-3-0
Maintainer: Your Name <your@email.com>
Description: A Flutter application
EOF

dpkg-deb --build "${PKG_DIR}"

echo "Creating AppImage..."
mkdir -p AppDir/usr/bin
cp -r build/linux/x64/release/bundle/* AppDir/usr/bin/
cp linux/packaging/myapp.desktop AppDir/
cp linux/packaging/myapp.png AppDir/
cat > AppDir/AppRun << 'APPRUN'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export LD_LIBRARY_PATH="${HERE}/usr/bin/lib:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/myapp" "$@"
APPRUN
chmod +x AppDir/AppRun

if [ -f appimagetool-x86_64.AppImage ]; then
  ./appimagetool-x86_64.AppImage AppDir "${APP_NAME}-${VERSION}-x86_64.AppImage"
fi

echo "Build complete!"
echo "Packages:"
echo "  - ${APP_NAME}-${VERSION}-linux-x64.tar.gz"
echo "  - ${PKG_DIR}.deb"
echo "  - ${APP_NAME}-${VERSION}-x86_64.AppImage (if appimagetool available)"
```

### 11. Output Summary

```
Linux Packages Created
======================

App: MyApp
Version: 1.0.0

Build:
- Architecture: x86_64
- GTK: 3.0
- Dependencies: libgtk-3-0

Packages Created:
- Tarball: myapp-1.0.0-linux-x64.tar.gz (25 MB)
- DEB: myapp_1.0.0-1_amd64.deb (24 MB)
- AppImage: myapp-1.0.0-x86_64.AppImage (35 MB)
- Snap: myapp_1.0.0_amd64.snap (45 MB)
- Flatpak: myapp.flatpak (40 MB)

Installation:
- DEB: sudo dpkg -i myapp_1.0.0-1_amd64.deb
- AppImage: chmod +x myapp.AppImage && ./myapp.AppImage
- Snap: sudo snap install myapp.snap --dangerous
- Flatpak: flatpak install myapp.flatpak

Distribution:
- Snap Store: snapcraft upload
- Flathub: Submit to flathub/flathub
- AUR: Create PKGBUILD
- PPA: Upload to Launchpad

Next Steps:
1. Test on different distributions
2. Publish to stores
3. Update download links
```

## Agent Reference

For Linux platform details, consult the `flutter-linux-platform` agent.
