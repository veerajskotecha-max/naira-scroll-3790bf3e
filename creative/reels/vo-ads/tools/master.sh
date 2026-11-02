#!/bin/bash
# master.sh <ad> [mix] [out]: <ad>/<mix>.wav -> <ad>/<out>.wav at -14 LUFS integrated, true peak at or under -1 dBTP
# (ebur128 measure, alimiter). The limiter shaves a little loudness, so the gain is corrected once from the first pass.
a=$1; in=$a/${2:-mix}.wav; out=$a/${3:-master}.wav
meas() { ffmpeg -nostdin -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/ I:/{i=$2} s&&/Peak:/{p=$2} END{print i, p}'; }
lim() { ffmpeg -nostdin -v error -y -i $in -af "volume=${1}dB,alimiter=limit=0.841:level=false:attack=4:release=60" -ar 48000 -c:a pcm_f32le $out; }
read I TP < <(meas $in)
G=$(python3 -c "print(round(-14.0 - $I, 2))"); lim $G
read I2 TP2 < <(meas $out)
G=$(python3 -c "print(round($G + (-14.0 - $I2), 2))"); lim $G
read I3 TP3 < <(meas $out)
echo "$a $(basename $out .wav)  mix I=$I TP=$TP  gain ${G} dB  ->  I=$I3 LUFS  TP=$TP3 dBTP"
