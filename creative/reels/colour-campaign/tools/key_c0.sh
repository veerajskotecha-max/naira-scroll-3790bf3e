#!/bin/bash
# key_c0.sh <S> <src frames dir> <width>: Ad 0's shots luma-keyed out of black into RGBA WebP, one frame set per shot,
# so the ring can sit in a colour world. turn + top-down: row-median backdrop removal; end card: the light bars' rows
# masked (they get redrawn in the world's colour). Frame ranges are the source's own cuts at 24 fps.
S=$1; SRC=$2; WD=$3; SOL=$(python3.13 -c "print(round(9*$3/1080))"); T=$S/ads/tools; F=$S/ads/frames; sc=$(python3.13 -c "print($WD/1080)")
cut() { d=$S/col/cut_$1_$WD; rm -rf $d; mkdir -p $d; i=1; for k in $(seq $2 $3); do ln -s $SRC/$(printf f_%04d.jpg $k) $d/$(printf f_%04d.jpg $i); i=$((i+1)); done; echo "{\"fps\": 24, \"n\": $((i-1)), \"sq\": true}" > $d/meta.json; echo $d; }
b() { python3.13 -c "print(','.join(str(round(float(v)*$sc)) for v in '$1'.split(',')))"; }
python3.13 -I $T/plate.py $(cut turn 136 208) $F/k0_turn_$WD --w $WD --gain 2.2 --floor 16 --rowbg 1.0 --solid $SOL --webp &
python3.13 -I $T/plate.py $(cut top 209 284) $F/k0_top_$WD --w $WD --gain 2.2 --floor 16 --rowbg 1.0 --solid $SOL --webp &
python3.13 -I $T/plate.py $(cut end 285 361) $F/k0_end_$WD --w $WD --gain 2.2 --floor 16 --rowbg 1.0 --solid $SOL --band $(b 236,398,24) --band $(b 684,842,24) --webp &
wait
