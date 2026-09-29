#!/bin/sh
# All gates, in order (stops at the first failure). Needs `npm install` (playwright-core) and Chrome.
#   sh bench/verify.sh [--quick]   (--quick: skip the real-time Chrome runs)
cd "$(dirname "$0")/.."
N="node --import ./bench/harness/register.mjs --no-warnings"
# run a gate, print its last line; on a non-zero exit print its tail and stop (sh has no pipefail)
g() { out=$("$@" 2>&1); rc=$?; if [ $rc -ne 0 ]; then echo "$out" | tail -5; echo "GATE FAILED: $*"; exit 1; fi; echo "$out" | tail -1; }
echo "== ch1 hash gate (Node)";      g $N bench/harness/check.mjs
echo "== rig / dual-wield probes";   g $N bench/harness/rigprobe.mjs; g $N bench/harness/dualprobe.mjs
echo "== ch1 bot (?dev chapter)";    g $N bench/bot/run.mjs --char zhaoyun --quiet
echo "== character + boss gates";   g $N bench/chars/gates.mjs tit; g $N bench/chars/gates.mjs chui
g $N bench/chars/boss.mjs tit; g $N bench/chars/boss.mjs chui
echo "== scroll columns";            g $N bench/harness/cols.mjs
for ch in kc1 kc2 kc3 kc4; do
  echo "== $ch: map gate + bot (both playables × steady / rush / back)"
  g $N bench/maps/mapcheck.mjs $ch tit; g $N bench/maps/mapcheck.mjs $ch chui
  for c in tit chui; do for st in steady rush back; do g $N bench/bot/run.mjs --char $c --chapter $ch --style $st --quiet; done; done
done
for c in tit chui; do for st in steady rush back; do g $N bench/bot/run.mjs --char $c --style $st --quiet; done; done
[ "$1" = "--quick" ] && { echo "QUICK GATES GREEN"; exit 0; }
echo "== Chrome: boot, title, scrolls"; g node bench/harness/smoke.mjs "?x" 4; g node bench/harness/title-check.mjs bench/out
g node bench/harness/shots-scroll.mjs ch1; g node bench/harness/shots-scroll.mjs kc1 --char tit; g node bench/harness/shots-scroll.mjs kc2 --char chui
g node bench/harness/shots-scroll.mjs kc3 --char tit; g node bench/harness/shots-scroll.mjs kc4 --char chui; g node bench/harness/shots-scroll.mjs kc4 --char chui --ending
echo "== Chrome: crowd, result cards"; g node bench/harness/crowdprobe.mjs ch1; g node bench/harness/result-fit.mjs ../out
echo "== Chrome: ch1 checkpoints";   g node bench/harness/xcheck.mjs ch1-zhaoyun 3600; g node bench/harness/xcheck.mjs ch1-huangzhong 3600
echo "== Chrome: Musou frame time"; g node bench/chars/perf.mjs tit chui zhaoyun
echo "== Chrome: ending flow";       g node bench/harness/scroll-flow.mjs kc4
echo "== Chrome: touch hook";        g node bench/harness/touch-twin.mjs; g node bench/harness/touch-ui.mjs
echo "ALL GATES GREEN"
