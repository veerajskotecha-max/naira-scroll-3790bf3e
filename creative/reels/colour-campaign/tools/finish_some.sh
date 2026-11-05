#!/bin/bash
# finish_some.sh <S> <build> ...: finish_redo.sh for the named builds only (a re-render after a fix). Takes each build's
# fin line (name, bitrates) from finish_redo.sh, so the two never disagree.
S=$1; shift; cd $S/ads
eval "$(sed -n '/^fin() {/,/^}/p' tools/finish_redo.sh)"
for b in "$@"; do
  L=$(grep "^fin $b " tools/finish_redo.sh) || { echo "no fin line for $b"; exit 1; }
  eval "$L"
done
echo REDO DONE
