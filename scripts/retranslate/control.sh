#!/bin/bash
# Pause, resume or check the word-by-word re-translation (gemma4 via llama-server).
#
#   scripts/retranslate/control.sh pause          stop it and unload the model (frees ~8 GB)
#   scripts/retranslate/control.sh resume [HOURS] continue where it left off (default: no time limit)
#   scripts/retranslate/control.sh status         running or paused, progress, memory
#
# Progress is saved after every verse, so pausing loses at most one verse.
set -u
REPO="/Volumes/ssd-mac-storage/Cursor_Code/kingdomarabic"
LABEL="com.ethan.bible-retranslate"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PAUSE_FLAG="$REPO/logs/.retranslate-paused"
STATE="$REPO/bible-translations/.retranslate-state"
DOMAIN="gui/$(id -u)"

is_running() { launchctl list | awk -v l="$LABEL" '$1 != "-" && $3 == l' | grep -q .; }
latest_log() { ls -t "$REPO"/logs/retranslate_*.log 2>/dev/null | head -1; }
memory_line() {
  echo "memory: $(memory_pressure | tail -1 | sed 's/System-wide memory free percentage/free/'), swap $(sysctl -n vm.swapusage | awk '{print $6}') used"
}

write_plist() {
  mkdir -p "$HOME/Library/Logs/bible-retranslate"
  cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>$LABEL</string>
<key>ProgramArguments</key><array>
<string>/bin/bash</string>
<string>$REPO/scripts/retranslate/run_retranslate.sh</string>
<string>$1</string>
<string>$LABEL</string>
</array>
<key>RunAtLoad</key><true/>
<key>StandardOutPath</key><string>$HOME/Library/Logs/bible-retranslate/launchd.out</string>
<key>StandardErrorPath</key><string>$HOME/Library/Logs/bible-retranslate/launchd.err</string>
</dict></plist>
EOF
}

pause() {
  mkdir -p "$REPO/logs"
  touch "$PAUSE_FLAG"
  if is_running; then
    launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null && echo "Stopped the re-translation."
    echo "$(date) paused by control.sh" >>"$(latest_log)"
  else
    echo "It was not running."
  fi
  # The model runs in llama-server; stopping it frees the memory.
  pkill -f "llama-server .*--port 8089" 2>/dev/null
  sleep 2
  echo "Model stopped. Paused - use Resume to continue."
  memory_line
}

resume() {
  if is_running; then
    echo "Already running."
    return 0
  fi
  rm -f "$PAUSE_FLAG"
  launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
  write_plist "${1:-0}"
  launchctl bootstrap "$DOMAIN" "$PLIST"
  echo "Resumed; it continues from the last saved verse and runs until the Bible is done."
}

status() {
  if is_running; then echo "RUNNING"
  elif [ -f "$PAUSE_FLAG" ]; then echo "PAUSED since $(stat -f '%Sm' "$PAUSE_FLAG")"
  else echo "NOT RUNNING"; fi
  local done_count=0
  [ -f "$STATE/done.json" ] && done_count=$(/opt/homebrew/bin/python3 -c "import json;print(len(json.load(open('$STATE/done.json'))))")
  echo "chapters finished: $done_count / 1189"
  local log
  log=$(latest_log)
  [ -n "$log" ] && { echo "latest log: $log"; grep -E "done in|budget|COMPLETE|FAIL|ERROR" "$log" | tail -3 | sed 's/^/  /'; }
  memory_line
}

case "${1:-status}" in
  pause) pause ;;
  resume) resume "${2:-0}" ;;
  status) status ;;
  *) echo "usage: $0 pause | resume [HOURS] | status"; exit 1 ;;
esac
