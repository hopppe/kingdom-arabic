#!/bin/bash
# Launch the word-by-word re-translation after preflight checks. Run by launchd
# (see control.sh) so it keeps going after the terminal closes.
#   run_retranslate.sh [HOURS] [LAUNCHD_LABEL]
set -u
REPO="/Volumes/ssd-mac-storage/Cursor_Code/kingdomarabic"
PY=/opt/homebrew/bin/python3
MAX_HOURS="${1:-0}"  # 0 = no limit, run until the Bible is done
LABEL="${2:-}"
LOG="$REPO/logs/retranslate_$(date +%Y%m%d_%H%M).log"
mkdir -p "$REPO/logs"
exec >>"$LOG" 2>&1

fail() { echo "PREFLIGHT FAIL: $*"; exit 1; }

echo "=== start $(date) budget=${MAX_HOURS}h (0 = no limit) job=${LABEL:-manual} ==="
echo "memory: $(memory_pressure | tail -1) | swap $(sysctl -n vm.swapusage)"

[ -f "$REPO/logs/.retranslate-paused" ] && fail "paused (scripts/retranslate/control.sh resume)"
source /Volumes/ssd-mac-storage/AI/ai-env.sh || fail "SSD not mounted"
[ -x "$PY" ] || fail "python missing at $PY"
"$PY" -c 'import requests' 2>/dev/null || fail "python requests missing"

# macOS swap lives on the internal disk; leave headroom.
sys_avail=$(df -g / | awk 'NR==2{print $4}')
[ "$sys_avail" -ge 15 ] || fail "only ${sys_avail}G free on the internal disk"

# One model at a time on 16 GB.
if launchctl list | awk '$1 != "-" && $3 == "com.ethan.turbofieldfare-server"' | grep -q .; then
  fail "turbofieldfare-server is running - two LLM servers will exhaust swap"
fi

# Free anything Ollama holds (only one copy of a model fits alongside everything else).
for m in $(/opt/homebrew/bin/ollama ps 2>/dev/null | awk 'NR>1{print $1}'); do
  curl -s http://localhost:11434/api/generate -d "{\"model\":\"$m\",\"keep_alive\":0}" >/dev/null
done
xcrun simctl shutdown all 2>/dev/null

# gemma4 via llama.cpp: --swa-full lets the server reuse the cached verse prefix
# for every word (Ollama can't with this model), ~6x faster.
GGUF="$OLLAMA_MODELS/blobs/sha256-1278394b693672ac2799eadc9a83fd98259a6a88a40acfb1dcaa6c6fc895a606"
[ -f "$GGUF" ] || fail "gemma4 model file missing: $GGUF"
if ! curl -sf http://127.0.0.1:8089/health >/dev/null; then
  /opt/homebrew/bin/llama-server -m "$GGUF" --swa-full -c 4096 -ngl 99 -np 1 --port 8089 --host 127.0.0.1 \
    --jinja --cache-type-k q8_0 --cache-type-v q8_0 -fa on >>"$REPO/logs/llama-server.log" 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 60); do curl -sf http://127.0.0.1:8089/health >/dev/null && break; sleep 2; done
  curl -sf http://127.0.0.1:8089/health >/dev/null || fail "llama-server did not start (see logs/llama-server.log)"
fi

echo "preflight OK"
cd "$REPO" || fail "repo missing"
caffeinate -i -s "$PY" scripts/retranslate/retranslate_bible.py --max-hours "$MAX_HOURS"
rc=$?
echo "=== end $(date) rc=$rc ==="
pkill -f "llama-server .*--port 8089" 2>/dev/null

# Rebuild the app's Bible database from the updated mappings.
"$PY" scripts/build_bible_db.py | tail -2

if [ -n "$LABEL" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
fi
