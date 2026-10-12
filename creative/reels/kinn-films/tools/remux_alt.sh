#!/bin/bash
# the mix-and-match versions: the finished picture, untouched (stream copy), with the tempo-matched alternate track
O="$(dirname "$0")"; FF="$O/../../ffmpeg"; cd "$O"
for p in hair:hair_trackA hoop:hoop_trackA maine:maine_trackC; do
  v=${p%%:*}; a=${p##*:}
  $FF -hide_banner -nostdin -y -v error -i final/$v.mp4 -i audio/$a.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart final/$a.mp4
  $FF -hide_banner -nostdin -y -v error -i web/$v.mp4 -i audio/$a.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart web/$a.mp4
  cp web/$v.jpg web/$a.jpg
  echo "$a final $(stat -c %s final/$a.mp4) web $(stat -c %s web/$a.mp4)"
done
