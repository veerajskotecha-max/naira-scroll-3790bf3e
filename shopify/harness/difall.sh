#!/bin/bash
# Diff every ported page: React route  <->  theme template
cd "$(dirname "$0")"
export REACT_BASE=http://127.0.0.1:4325
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
"
printf "%-26s %-22s %7s %7s %7s\n" ROUTE TEMPLATE MISSING EXTRA DRIFT
for p in $PAIRS; do
  r="${p%%|*}"; t="${p##*|}"
  out=$(node styledif.mjs "$r" "/$t" --json "/tmp/dif-$t.json" 2>/dev/null | grep -E '^MISSING')
  m=$(echo "$out" | sed -n 's/.*MISSING \([0-9]*\).*/\1/p')
  e=$(echo "$out" | sed -n 's/.*EXTRA \([0-9]*\).*/\1/p')
  d=$(echo "$out" | sed -n 's/.*DRIFT \([0-9]*\).*/\1/p')
  printf "%-26s %-22s %7s %7s %7s\n" "$r" "$t" "${m:-ERR}" "${e:-ERR}" "${d:-ERR}"
done
