#!/bin/bash
# Overnight gloss review, resumable. Usage: overnight_review.sh [HOURS] [LAUNCHD_LABEL]
# Each scheduled night is its own one-shot launchd job that passes its budget and
# label; the job unloads itself after it runs, and unloads every remaining
# com.ethan.bible-review* job once the whole Bible is done.
set -u
REPO="/Volumes/ssd-mac-storage/Cursor_Code/kingdomarabic"
PY=/opt/homebrew/bin/python3
MODEL="gemma4:12b"
MAX_HOURS="${1:-6}"
LABEL="${2:-}"
LOG="$REPO/logs/overnight_review_$(date +%Y%m%d_%H%M).log"
mkdir -p "$REPO/logs"
exec >>"$LOG" 2>&1

fail() { echo "PREFLIGHT FAIL: $*"; exit 1; }

# paused with scripts/review_control.sh pause - scheduled nights respect it too
[ -f "$REPO/logs/.review-paused" ] && fail "review is paused (scripts/review_control.sh resume)"

echo "=== start $(date) budget=${MAX_HOURS}h job=${LABEL:-manual} ==="
echo "memory: $(sysctl -n vm.swapusage) | $(memory_pressure | tail -1)"

# ---------- preflight ----------
source /Volumes/ssd-mac-storage/AI/ai-env.sh || fail "SSD not mounted"
[ -d "$REPO/bible-translations/mappings" ] || fail "mappings dir missing"
[ -x "$PY" ] || fail "python missing at $PY"
"$PY" -c 'import requests, json' 2>/dev/null || fail "python deps missing"

# free space: proposals are small but logs + json need headroom
avail=$(df -g "$REPO" | awk 'NR==2{print $4}')
[ "$avail" -ge 2 ] || fail "only ${avail}G free on the SSD"
# macOS swap lives on the internal disk; the past crashes were swap exhaustion
sys_avail=$(df -g / | awk 'NR==2{print $4}')
[ "$sys_avail" -ge 30 ] || fail "only ${sys_avail}G free on the internal disk (swap needs headroom)"

# one model at a time on 16 GB: the other LLM server must be off
if launchctl list | awk '$1 != "-" && $3 == "com.ethan.turbofieldfare-server"' | grep -q .; then
  fail "turbofieldfare-server is running - two LLM servers will exhaust swap"
fi

# ollama up?
if ! curl -sf http://localhost:11434/api/tags >/dev/null; then
  echo "ollama not responding - starting service"
  /opt/homebrew/bin/brew services start ollama
  sleep 20
  curl -sf http://localhost:11434/api/tags >/dev/null || fail "ollama would not start"
fi
curl -s http://localhost:11434/api/tags | grep -q "$MODEL" || fail "$MODEL not installed"

# a booted iOS simulator left over from daytime testing holds ~1-2 GB
xcrun simctl shutdown all 2>/dev/null && echo "simulators shut down"

# release any other model Ollama still holds from daytime use
for m in $(/opt/homebrew/bin/ollama ps 2>/dev/null | awk 'NR>1{print $1}'); do
  [ "$m" = "$MODEL" ] && continue
  echo "unloading $m"
  curl -s http://localhost:11434/api/generate -d "{\"model\":\"$m\",\"keep_alive\":0}" >/dev/null
done

# canary: the model must actually answer in the expected shape
canary=$(curl -s http://localhost:11434/api/generate -d "{\"model\":\"$MODEL\",\"prompt\":\"Reply with exactly: READY\",\"stream\":false,\"think\":false,\"options\":{\"temperature\":0,\"num_ctx\":4096,\"use_mmap\":true}}" | "$PY" -c 'import json,sys; print(json.load(sys.stdin).get("response","").strip()[:20])')
echo "canary: $canary"
case "$canary" in *READY*) ;; *) fail "model canary failed (got: $canary)";; esac

# quality gates must behave as specified before we trust 6h of output
"$PY" "$REPO/scripts/test_review_quality.py" >/dev/null 2>&1 || fail "quality gate tests failing"
echo "preflight OK - ${MAX_HOURS}h budget"

# ---------- run ----------
caffeinate -i -s "$PY" "$REPO/scripts/review_mappings_v2.py" ALL \
    --skip MAT,MRK,LUK,JHN --detect-all --max-hours "$MAX_HOURS"
rc=$?

# ---------- always release the model ----------
curl -s http://localhost:11434/api/generate -d "{\"model\":\"$MODEL\",\"keep_alive\":0}" >/dev/null
echo "=== end $(date) rc=$rc ==="

# one-shot: this night's job is spent whether or not it finished
if [ -n "$LABEL" ]; then
  launchctl unload "$HOME/Library/LaunchAgents/$LABEL.plist" 2>/dev/null
fi
# whole Bible done: cancel any later nights too
if grep -q "^COMPLETE:" "$LOG"; then
  echo "all books done - unloading remaining scheduled nights"
  for f in "$HOME"/Library/LaunchAgents/com.ethan.bible-review*.plist; do
    launchctl unload "$f" 2>/dev/null
  done
fi
