#!/bin/bash
# Pause, resume or check the Bible gloss review, e.g. when you need the RAM back.
#
#   scripts/review_control.sh pause          stop the review and unload the model (frees ~8 GB)
#   scripts/review_control.sh resume [HOURS] start it again where it left off (default budget 20h)
#   scripts/review_control.sh status         running or paused, progress, memory
#
# Pausing loses at most the chapter in progress (each chapter is saved as it
# finishes). While paused, scheduled overnight runs skip themselves too.
set -u
REPO="/Volumes/ssd-mac-storage/Cursor_Code/kingdomarabic"
MODEL="gemma4:12b"
LABEL="com.ethan.bible-review.now"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PAUSE_FLAG="$REPO/logs/.review-paused"
REVIEW_DIR="$REPO/bible-translations/review-v2-gemma4-12b"
UID_DOMAIN="gui/$(id -u)"

running_labels() {
  launchctl list | awk '$1 != "-" && $3 ~ /^com\.ethan\.bible-review/ {print $3}'
}

unload_model() {
  curl -s http://localhost:11434/api/generate -d "{\"model\":\"$MODEL\",\"keep_alive\":0}" >/dev/null 2>&1 || true
}

latest_log() {
  ls -t "$REPO"/logs/overnight_review_*.log 2>/dev/null | head -1
}

memory_line() {
  echo "memory: $(memory_pressure | tail -1 | sed 's/System-wide memory free percentage/free/'), swap $(sysctl -n vm.swapusage | awk '{print $6}') used"
}

write_plist() {
  local hours="$1"
  mkdir -p "$HOME/Library/Logs/bible-review"
  cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>$LABEL</string>
<key>ProgramArguments</key><array>
<string>/bin/bash</string>
<string>$REPO/scripts/overnight_review.sh</string>
<string>$hours</string>
<string>$LABEL</string>
</array>
<key>RunAtLoad</key><true/>
<key>StandardOutPath</key><string>$HOME/Library/Logs/bible-review/launchd.out</string>
<key>StandardErrorPath</key><string>$HOME/Library/Logs/bible-review/launchd.err</string>
</dict></plist>
EOF
}

pause() {
  mkdir -p "$REPO/logs"
  touch "$PAUSE_FLAG"
  local labels
  labels=$(running_labels)
  if [ -z "$labels" ]; then
    echo "No review is running."
  else
    for label in $labels; do
      # Stops the job's whole process group (the shell, the reviewer and caffeinate).
      launchctl bootout "$UID_DOMAIN/$label" 2>/dev/null && echo "Stopped $label"
    done
    echo "$(date) paused by review_control.sh" >>"$(latest_log)"
  fi
  unload_model
  sleep 2
  echo "Model unloaded. Paused - run '$0 resume' to continue."
  memory_line
}

resume() {
  local hours="${1:-20}"
  if [ -n "$(running_labels)" ]; then
    echo "Already running: $(running_labels)"
    return 0
  fi
  rm -f "$PAUSE_FLAG"
  launchctl bootout "$UID_DOMAIN/$LABEL" 2>/dev/null || true
  write_plist "$hours"
  launchctl bootstrap "$UID_DOMAIN" "$PLIST"
  echo "Resumed with a ${hours}h budget; it picks up where it left off."
  echo "Log: $(latest_log)"
}

status() {
  local labels
  labels=$(running_labels)
  if [ -n "$labels" ]; then
    echo "RUNNING ($labels)"
  elif [ -f "$PAUSE_FLAG" ]; then
    echo "PAUSED since $(stat -f '%Sm' "$PAUSE_FLAG")"
  else
    echo "NOT RUNNING"
  fi
  local chapters
  chapters=$(find "$REVIEW_DIR" -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
  echo "chapters reviewed so far: $chapters"
  local log
  log=$(latest_log)
  [ -n "$log" ] && { echo "latest log: $log"; tail -3 "$log" | sed 's/^/  /'; }
  memory_line
}

case "${1:-status}" in
  pause) pause ;;
  resume) resume "${2:-20}" ;;
  status) status ;;
  *) echo "usage: $0 pause | resume [HOURS] | status"; exit 1 ;;
esac
