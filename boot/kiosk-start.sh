#!/bin/bash
# Dashcore Kiosk X Session

#
export DISPLAY=:0

# Disable screen blanking/power saving
xset s off
xset -dpms
xset s noblank

# Hide cursor
unclutter -idle 0 -root &

# Set black background while Chromium loads
xsetroot -solid black

# Launch Chromium in kiosk mode
exec chromium \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --kiosk \
  --no-sandbox \
  --disable-gpu \
  --incognito \
  --disable-translate \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  --app=http://localhost:8080
