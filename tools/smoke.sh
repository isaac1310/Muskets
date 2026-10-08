#!/bin/zsh
# Full smoke test after any change: build, parse, every node check, a short campaign run,
# then real headless-Chrome battles with the console watched for script errors.
# Usage: tools/smoke.sh            (screenshots go to tools/smoke-out/)
set -u
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
if [[ -x "$CHROME" ]]; then
  (cd offline && python3 -m http.server $PORT >/dev/null 2>&1 &) ; sleep 1
  for h in practice practice-fire practice-close review-fort review-forest review-river review-map; do
    log=$("$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=500,900 --enable-logging=stderr --v=0 \
      --virtual-time-budget=20000 --screenshot=$OUT/$h.png "http://localhost:$PORT/index.html?s=$RANDOM#$h" 2>&1 \
      | grep "CONSOLE" | grep -E "Uncaught|Error|TypeError|ReferenceError" | grep -v "AudioContext")
    if [[ -n "$log" ]]; then bad "#$h"; print "$log" | head -3; else print "  #$h: no script errors"; fi
  done
  pkill -f "http.server $PORT"
else
  print "  Chrome not found; skipped"
fi

(( fail )) && { print -P "%F{red}Smoke test FAILED%f"; exit 1 } || print -P "%F{green}Smoke test passed. Screenshots in $OUT/%f"
