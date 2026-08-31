#!/bin/bash
# Horizontal-overflow check: body wider than the viewport means the page
# scrolls sideways. React is the reference; the theme must match.
cd "$(dirname "$0")"
W=${1:-390}
PAIRS="/|index /about|page.about /contact|page.contact /faqs|page.faqs /privacy|page.privacy-policy
/terms|page.terms /exchange-return-policy|page.exchange-return /concepts|page.concepts
/customize|page.customise /journal|blog /jewellery|collection
/jewellery/riviere-eternal-necklace|product"
printf "%-38s %-22s %10s %10s  %s\n" ROUTE TEMPLATE REACT_BODY THEME_BODY VERDICT
for p in $PAIRS; do
  r="${p%%|*}"; t="${p##*|}"
  rb=$(node overflow.mjs "$W" http://127.0.0.1:4325 "$r" 2>/dev/null | sed -n 's/.*"bodyWidth": \([0-9]*\).*/\1/p')
  tb=$(node overflow.mjs "$W" http://127.0.0.1:4310 "/$t" 2>/dev/null | sed -n 's/.*"bodyWidth": \([0-9]*\).*/\1/p')
  v=OK; [ "${tb:-0}" -gt "$W" ] 2>/dev/null && v="THEME SCROLLS SIDEWAYS"
  [ "${rb:-0}" -gt "$W" ] 2>/dev/null && v="$v (react too)"
  printf "%-38s %-22s %10s %10s  %s\n" "$r" "$t" "${rb:-?}" "${tb:-?}" "$v"
done
