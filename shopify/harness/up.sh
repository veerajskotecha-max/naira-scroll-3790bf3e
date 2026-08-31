#!/bin/bash
# Ensure both harness servers are up. They get reaped when a tool call's
# process group is cleaned up, so setsid detaches them from it.
cd "$(dirname "$0")"
for pair in "4310 serve.mjs" "4325 spa.mjs"; do
  set -- $pair
  if [ "$(curl -s -o /dev/null -w '%{http_code}' --noproxy '*' -m 3 http://127.0.0.1:$1/)" != "200" ]; then
    setsid nohup node "$2" > /tmp/harness-$1.log 2>&1 < /dev/null &
    disown 2>/dev/null
  fi
done
sleep 3
for p in 4310 4325; do printf "%s: %s\n" $p "$(curl -s -o /dev/null -w '%{http_code}' --noproxy '*' -m 3 http://127.0.0.1:$p/)"; done
