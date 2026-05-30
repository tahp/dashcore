#!/bin/bash
# ============================================================
# Dashcore Boot Splash Installer
# For Raspberry Pi 4 Model B running Raspberry Pi OS (Bookworm)
#
# This script configures a seamless boot experience:
#   1. GPU firmware splash (immediate on power-on)
#   2. Plymouth theme (during kernel/service init)
#   3. Chromium kiosk launches with app pre-boot splash
#
# Run as root: sudo bash install-boot-splash.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check we're running as root
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root. Use: sudo bash $0"
fi

# Detect boot partition location
if [ -d "/boot/firmware" ]; then
    BOOT_DIR="/boot/firmware"
elif [ -d "/boot" ]; then
    BOOT_DIR="/boot"
else
    error "Cannot find boot partition"
fi

info "Boot partition detected at: $BOOT_DIR"

# ============================================================
# STAGE 1: GPU Firmware Splash
# ============================================================
info "Installing firmware splash image..."

cp "$SCRIPT_DIR/firmware/splash.png" "$BOOT_DIR/splash.png"
success "Splash image copied to $BOOT_DIR/splash.png"

# Update config.txt
CONFIG_FILE="$BOOT_DIR/config.txt"

# Backup original
if [ ! -f "$CONFIG_FILE.dashcore-backup" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.dashcore-backup"
    info "Original config.txt backed up"
fi

# Add splash settings if not already present
if ! grep -q "disable_splash=1" "$CONFIG_FILE"; then
    cat >> "$CONFIG_FILE" << 'EOF'

# --- Dashcore Boot Splash ---
disable_splash=1
boot_delay=0
avoid_warnings=1
disable_overscan=1
EOF
    success "config.txt updated with splash settings"
else
    info "config.txt already has splash settings, skipping"
fi

# ============================================================
# STAGE 2: Kernel Silent Boot (cmdline.txt)
# ============================================================
info "Configuring silent kernel boot..."

CMDLINE_FILE="$BOOT_DIR/cmdline.txt"

# Backup original
if [ ! -f "$CMDLINE_FILE.dashcore-backup" ]; then
    cp "$CMDLINE_FILE" "$CMDLINE_FILE.dashcore-backup"
    info "Original cmdline.txt backed up"
fi

# Read current cmdline
CURRENT_CMDLINE=$(cat "$CMDLINE_FILE")

# Add silent boot parameters if not present
PARAMS_TO_ADD="quiet splash plymouth.ignore-serial-consoles logo.nologo vt.global_cursor_default=0 loglevel=0"

for param in $PARAMS_TO_ADD; do
    if ! echo "$CURRENT_CMDLINE" | grep -q "$param"; then
        CURRENT_CMDLINE="$CURRENT_CMDLINE $param"
    fi
done

# Redirect console to tty3 (invisible)
if ! echo "$CURRENT_CMDLINE" | grep -q "console=tty3"; then
    # Remove any existing console=ttyX
    CURRENT_CMDLINE=$(echo "$CURRENT_CMDLINE" | sed 's/console=tty[0-9]//g')
    CURRENT_CMDLINE="$CURRENT_CMDLINE console=tty3"
fi

# Write back (must be single line, no trailing newline)
echo -n "$CURRENT_CMDLINE" | tr -s ' ' > "$CMDLINE_FILE"
success "cmdline.txt configured for silent boot"

# ============================================================
# STAGE 3: Plymouth Theme
# ============================================================
info "Installing Plymouth theme..."

# Install Plymouth if not present
if ! command -v plymouth &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq plymouth plymouth-themes
fi

# Install Dashcore Plymouth theme
PLYMOUTH_DIR="/usr/share/plymouth/themes/dashcore"
mkdir -p "$PLYMOUTH_DIR"
cp "$SCRIPT_DIR/plymouth/dashcore/dashcore.plymouth" "$PLYMOUTH_DIR/"
cp "$SCRIPT_DIR/plymouth/dashcore/dashcore.script" "$PLYMOUTH_DIR/"
cp "$SCRIPT_DIR/plymouth/dashcore/splash-1024x600.png" "$PLYMOUTH_DIR/"
cp "$SCRIPT_DIR/plymouth/dashcore/splash.png" "$PLYMOUTH_DIR/"
cp "$SCRIPT_DIR/plymouth/dashcore/progress-bar.png" "$PLYMOUTH_DIR/"

success "Plymouth theme files installed to $PLYMOUTH_DIR"

# Set as default theme
plymouth-set-default-theme dashcore
update-initramfs -u 2>/dev/null || true
success "Plymouth theme set as default"

# ============================================================
# STAGE 4: Chromium Kiosk Autostart
# ============================================================
info "Configuring Chromium kiosk autostart..."

# Create the autostart for the dashcore user (or current user)
DASHCORE_USER="${SUDO_USER:-pi}"
DASHCORE_HOME=$(eval echo "~$DASHCORE_USER")
AUTOSTART_DIR="$DASHCORE_HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"

# Determine the app URL (local build served or dev server)
APP_URL="http://localhost:5173"
BUILD_DIR="$REPO_ROOT/frontend/dist"

if [ -d "$BUILD_DIR" ]; then
    APP_URL="file://$BUILD_DIR/index.html"
fi

cat > "$AUTOSTART_DIR/dashcore-kiosk.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Dashcore Kiosk
Exec=chromium-browser --noerrdialogs --disable-infobars --disable-session-crashed-bubble --kiosk --incognito --disable-translate --disable-features=TranslateUI --check-for-update-interval=31536000 --app=$APP_URL
Hidden=false
X-GNOME-Autostart-enabled=true
EOF

chown -R "$DASHCORE_USER:$DASHCORE_USER" "$AUTOSTART_DIR"
success "Chromium kiosk autostart configured for user: $DASHCORE_USER"

# ============================================================
# STAGE 5: Disable desktop splash / login screen
# ============================================================
info "Configuring auto-login and disabling desktop splash..."

# Enable auto-login (for Raspberry Pi OS with desktop)
LIGHTDM_CONF="/etc/lightdm/lightdm.conf"
if [ -f "$LIGHTDM_CONF" ]; then
    if ! grep -q "autologin-user=$DASHCORE_USER" "$LIGHTDM_CONF"; then
        sed -i "s/^#autologin-user=.*/autologin-user=$DASHCORE_USER/" "$LIGHTDM_CONF" 2>/dev/null || true
    fi
fi

# Disable the Raspberry Pi OS desktop splash (piwiz, etc.)
if [ -f "/etc/xdg/autostart/piwiz.desktop" ]; then
    mv "/etc/xdg/autostart/piwiz.desktop" "/etc/xdg/autostart/piwiz.desktop.disabled" 2>/dev/null || true
fi

success "Auto-login configured"

# ============================================================
# STAGE 6: Hide cursor (for touchscreen kiosk)
# ============================================================
info "Installing cursor hiding for kiosk mode..."

if ! command -v unclutter &> /dev/null; then
    apt-get install -y -qq unclutter
fi

cat > "$AUTOSTART_DIR/hide-cursor.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Hide Cursor
Exec=unclutter -idle 0.1 -root
Hidden=false
X-GNOME-Autostart-enabled=true
EOF

chown -R "$DASHCORE_USER:$DASHCORE_USER" "$AUTOSTART_DIR"
success "Cursor hiding configured"

# ============================================================
# DONE
# ============================================================
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} Dashcore boot splash installation complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Boot sequence will be:"
echo "  1. Power on → Dashcore logo (GPU firmware splash)"
echo "  2. Kernel init → Dashcore logo (Plymouth theme)"
echo "  3. Desktop loads → Dashcore logo (HTML pre-boot splash)"
echo "  4. React mounts → Dashcore logo (app boot screen)"
echo "  5. App ready → Fade to home screen"
echo ""
echo "Reboot to test: sudo reboot"
echo ""
echo "To revert all changes:"
echo "  sudo cp $CONFIG_FILE.dashcore-backup $CONFIG_FILE"
echo "  sudo cp $CMDLINE_FILE.dashcore-backup $CMDLINE_FILE"
echo "  sudo plymouth-set-default-theme --reset"
echo "  sudo update-initramfs -u"
echo "  rm $AUTOSTART_DIR/dashcore-kiosk.desktop"
echo "  rm $AUTOSTART_DIR/hide-cursor.desktop"
