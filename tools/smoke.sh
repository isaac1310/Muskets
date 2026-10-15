#!/bin/zsh
# Full smoke test after any change: build, parse, every node check, a short campaign run,
# then real headless-Chrome battles with the console watched for script errors.
# Usage: tools/smoke.sh            (screenshots go to tools/smoke-out/)
set -u
unsetopt bgnice
cd "${0:A:h}/.."
OUT=tools/smoke-out; mkdir -p $OUT
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=8799
fail=0
step(){ print -P "%F{cyan}== $1%f" }
bad(){ print -P "%F{red}FAIL: $1%f"; fail=1 }

step "build"
python3 build.py || bad "build.py"

step "parse"
node --check game/script.js || bad "game/script.js"
node --check game/battle.js || bad "game/battle.js"
node -e "for(const f of ['game/musket-crown.html','offline/index.html']){const s=require('fs').readFileSync(f,'utf8');new Function(s.split('<script>')[1].split('</script>')[0])}" || bad "built page script"

step "node checks"
for f in tools/*_check.js; do
  out=$(node "$f" 2>&1); code=$?
  print "  ${f:t}: ${out##*$'\n'}"
  (( code )) && bad "$f"
done

step "campaigns"
out=$(node tools/sim.js check 4 normal 2>&1 | tail -1)
print "  ${out[1,100]}"
[[ "$out" == *'"err":0'* ]] || bad "campaign simulation"

step "browser battles"
if [[ "${SKIP_BROWSER:-0}" == 1 ]]; then
  print "  Explicitly skipped; verify the browser separately."
elif [[ -x "$CHROME" ]]; then
  python3 -m http.server $PORT --bind 127.0.0.1 --directory offline >$OUT/server.log 2>&1 &
  server_pid=$!
  trap 'kill $server_pid 2>/dev/null || true' EXIT
  ready=0
  for attempt in {1..10}; do
    if ! kill -0 $server_pid 2>/dev/null; then break; fi
    if curl --silent --fail --max-time 2 "http://127.0.0.1:$PORT/manifest.webmanifest" >/dev/null; then ready=1; break; fi
    sleep .2
  done
  if (( ! ready )); then
    bad "preview server did not start (see $OUT/server.log)"
  else
    for h in practice practice-fire practice-close review-fort review-forest review-river review-hills review-map; do
      # Never mistake a previous screenshot or a failed browser launch for a pass.
      shot=$OUT/$h-new.png
      rm -f "$shot"
      if ! "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=500,900 --enable-logging=stderr --v=0 \
        --virtual-time-budget=20000 --screenshot="$shot" "http://127.0.0.1:$PORT/index.html?s=$RANDOM#$h" >$OUT/$h.log 2>&1; then
        bad "#$h: browser exited unsuccessfully (see $OUT/$h.log)"
      elif [[ ! -s "$shot" ]]; then
        bad "#$h: no new screenshot was produced"
      elif grep 'CONSOLE' $OUT/$h.log | grep -E 'Uncaught|Error|TypeError|ReferenceError' | grep -v 'AudioContext' >$OUT/$h-errors.log; then
        bad "#$h: script error (see $OUT/$h-errors.log)"
      else
        mv "$shot" $OUT/$h.png
        print "  #$h: fresh screenshot, no script errors"
      fi
    done
  fi
else
  bad "Chrome not found. Use SKIP_BROWSER=1 only when verifying the browser separately."
fi

if (( fail )); then print -P "%F{red}Smoke test FAILED%f"; exit 1; fi
if [[ "${SKIP_BROWSER:-0}" == 1 ]]; then print -P "%F{green}Core smoke checks passed; browser checks explicitly skipped.%f";
else print -P "%F{green}Smoke test passed. Screenshots in $OUT/%f"; fi
