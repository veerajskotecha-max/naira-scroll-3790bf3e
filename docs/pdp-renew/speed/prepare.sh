#!/bin/bash
# Production build + the site's own pre-build of every page, for each branch folder given.
# usage: prepare.sh <dir> <port> [<dir> <port> ...]   (run one after another; each takes a few minutes)
set -u
LOG=$(cd "$(dirname "$0")" && pwd)
while [ $# -ge 2 ]; do
  DIR=$1; PORT=$2; shift 2
  NAME=$(basename "$DIR")
  echo "== $NAME: vite build"
  (cd "$DIR" && npx vite build > "$LOG/$NAME-build.log" 2>&1); echo "   build exit $?"
  echo "== $NAME: prerender (port $PORT)"
  (cd "$DIR" && PRERENDER_PORT=$PORT npx tsx scripts/prerender.ts > "$LOG/$NAME-prerender.log" 2>&1); echo "   prerender exit $?"
  tail -4 "$LOG/$NAME-prerender.log" | cut -c1-200
  ls "$DIR/dist/jewellery/woven-gold-hoops/index.html" 2>/dev/null && wc -c < "$DIR/dist/jewellery/woven-gold-hoops/index.html"
  (cd "$DIR" && git status --short | head -5)
done
