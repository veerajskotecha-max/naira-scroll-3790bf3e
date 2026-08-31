#!/bin/bash
# Diff every ported page: React route <-> theme template.
# Usage: bash difall.sh [width]   (default 1440; use 390 for mobile)
cd "$(dirname "$0")"
export REACT_BASE=${REACT_BASE:-http://127.0.0.1:4325}
W=${1:-1440}
PAIRS="
/|index
/about|page.about
/contact|page.contact
/faqs|page.faqs
/privacy|page.privacy-policy
/terms|page.terms
/exchange-return-policy|page.exchange-return
/concepts|page.concepts
/customize|page.customise
/journal|blog
/jewellery|collection
/collections|list-collections
/jewellery/riviere-eternal-necklace|product
"
echo "=== viewport ${W}px ==="
printf "%-38s %-22s %7s %7s %7s %11s %13s\n" ROUTE TEMPLATE MISSING EXTRA DRIFT IMG_R/T HEIGHT_R/T
for p in $PAIRS; do
  r="${p%%|*}"; t="${p##*|}"
  raw=$(node styledif.mjs "$r" "/$t" --width "$W" --json "/tmp/dif-$W-$t.json" 2>&1)
  out=$(echo "$raw" | grep -E '^MISSING')
  m=$(echo "$out" | sed -n 's/.*MISSING \([0-9]*\).*/\1/p')
  e=$(echo "$out" | sed -n 's/.*EXTRA \([0-9]*\).*/\1/p')
  d=$(echo "$out" | sed -n 's/.*DRIFT \([0-9]*\).*/\1/p')
  mr=$(echo "$raw" | sed -n 's/.*react: .* \([0-9]*\) media.*/\1/p')
  mt=$(echo "$raw" | sed -n 's/.*theme: .* \([0-9]*\) media.*/\1/p')
  hr=$(echo "$raw" | sed -n 's/.*react: .* \([0-9]*\)px tall.*/\1/p')
  ht=$(echo "$raw" | sed -n 's/.*theme: .* \([0-9]*\)px tall.*/\1/p')
  printf "%-38s %-22s %7s %7s %7s %11s %13s\n" "$r" "$t" "${m:-ERR}" "${e:-ERR}" "${d:-ERR}" "${mr:-?}/${mt:-?}" "${hr:-?}/${ht:-?}"
done
