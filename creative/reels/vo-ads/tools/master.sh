#!/bin/bash
# master.sh <ad>: mix.wav -> master.wav at -14 LUFS integrated, true peak at or under -1 dBTP (ebur128 measure, alimiter).
# The limiter shaves a little loudness, so the gain is corrected once from the first pass.
a=$1
meas() { ffmpeg -nostdin -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/ I:/{i=$2} s&&/Peak:/{p=$2} END{print i, p}'; }
lim() { ffmpeg -nostdin -v error -y -i $a/mix.wav -af "volume=${1}dB,alimiter=limit=0.841:level=false:attack=4:release=60" -ar 48000 -c:a pcm_f32le $a/master.wav; }
read I TP < <(meas $a/mix.wav)
G=$(python3 -c "print(round(-14.0 - $I, 2))"); lim $G
read I2 TP2 < <(meas $a/master.wav)
G=$(python3 -c "print(round($G + (-14.0 - $I2), 2))"); lim $G
read I3 TP3 < <(meas $a/master.wav)
echo "$a  mix I=$I TP=$TP  gain ${G} dB  ->  master I=$I3 LUFS  TP=$TP3 dBTP"
