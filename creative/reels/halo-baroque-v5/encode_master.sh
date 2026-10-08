#!/bin/bash
# The master: lossless PNG frames (untouched source pixels under the graphics) -> H.264 High, CRF 12,
# BT.709 limited range, tagged so players don't guess; audio AAC 320k from the music-free mix.
set -e
S=${WORK:-.}; FF=${FFMPEG:-$S/ffmpeg}; cd $S/v12
OUT=${1:-naira-halo-baroque-final-master-no-music.mp4}; MIX=${2:-mix_nomusic.wav}
$FF -y -hide_banner -loglevel error -framerate 30 -i eng/out7/f_%05d.png -i $MIX \
  -vf "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset slow -crf 12 -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart $OUT
ls -la $OUT
