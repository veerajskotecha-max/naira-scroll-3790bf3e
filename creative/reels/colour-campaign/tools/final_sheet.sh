#!/bin/bash
# final_sheet.sh <mp4> <out.jpg> <t1> <t2> ...: frames from a delivered file, labelled, one row
f=$1; out=$2; shift 2; d=$(mktemp -d); i=0
for t in "$@"; do ffmpeg -v error -y -ss $t -i "$f" -frames:v 1 -vf "scale=360:-1,drawtext=text='$t s':x=8:y=8:fontcolor=white:fontsize=20:box=1:boxcolor=black@0.5" $d/$(printf %03d $i).jpg; i=$((i+1)); done
ffmpeg -v error -y -pattern_type glob -i "$d/*.jpg" -vf "tile=${#}x1" -frames:v 1 "$out"; rm -rf $d
