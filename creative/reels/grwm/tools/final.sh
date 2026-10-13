#!/bin/bash
# GRWM final: the user's edit with four timing fixes and the title, BT.709 TV range H.264, two-pass to fit the 29 MB send limit.
#   out 0-2      hold src 3        (src 0-2 were a 3-frame jump into the first shot)
#   out 3-253    src 3-253
#   out 254-258  ext 0-4           (raw 84BD71C7 1084-1088, graded to match: the earring shot now runs to the drop at 8.633 s)
#   out 259-523  src 259-523       (the close-up starts ON the drop; ends 2 frames early so the turn lands on the snare)
#   out 524-616  src 526-618       (the turn; loses its last 4 frames so the last shot lands on the hit at 20.56 s)
#   out 617-717  src 623-723       (last shot; src 724-726 were black)
set -euo pipefail
S=$1; V=$S/v20; FF=$S/ffmpeg; O=$V/out
FG="[0:v]scale=in_range=full:out_range=tv:in_color_matrix=bt709:out_color_matrix=bt709:flags=accurate_rnd,format=yuv420p,split=4[m0][m1][m2][m3];
[m0]trim=start_frame=3:end_frame=254,setpts=PTS-STARTPTS,tpad=start=3:start_mode=clone[a];
[1:v]scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p,setpts=PTS-STARTPTS[e];
[m1]trim=start_frame=259:end_frame=524,setpts=PTS-STARTPTS[b];
[m2]trim=start_frame=526:end_frame=619,setpts=PTS-STARTPTS[c];
[m3]trim=start_frame=623:end_frame=724,setpts=PTS-STARTPTS[d];
[a][e][b][c][d]concat=n=5:v=1:a=0,settb=1/30,setpts=N[v];
[2:v]format=rgba,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuva420p,settb=1/30,setpts=N[ov];
[v][ov]overlay=eof_action=pass:format=yuv420:alpha=straight,setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709[vo]"
IN=(-i $V/dl/grwm.mp4 -framerate 30 -i $V/ext/ext_%d.png -framerate 30 -i $V/ovf/%04d.png)
X264=(-c:v libx264 -preset slower -tune film -profile:v high -level:v 4.1 -g 60 -bf 3 -x264-params aq-mode=3 -pix_fmt yuv420p
      -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30)
RATE=${RATE:-9150k}
$FF -hide_banner -nostdin -y -v error "${IN[@]}" -filter_complex "$FG" -map "[vo]" "${X264[@]}" -b:v $RATE -pass 1 -passlogfile $O/x264 -an -f mp4 /dev/null
$FF -hide_banner -nostdin -y -v error "${IN[@]}" -filter_complex "$FG" -map "[vo]" "${X264[@]}" -b:v $RATE -pass 2 -passlogfile $O/x264 -an -movflags +faststart $O/grwm_v.mp4
# original audio: the music bed is not edited, so it stays in sync; trimmed to the new end with a short fade so the loop is clean
$FF -hide_banner -nostdin -y -v error -i $O/grwm_v.mp4 -i $V/dl/grwm.mp4 -map 0:v -map 1:a -c:v copy \
  -af "atrim=end=23.93333,asetpts=PTS-STARTPTS,afade=t=out:st=23.683:d=0.25" -c:a aac -b:a 320k -ar 44100 -movflags +faststart $O/naira-grwm-final.mp4
# no music: a silent track, so Instagram's own library audio can be added and tagged in the app
$FF -hide_banner -nostdin -y -v error -i $O/grwm_v.mp4 -f lavfi -i anullsrc=r=44100:cl=stereo -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 64k -shortest -movflags +faststart $O/naira-grwm-final-no-music.mp4
rm -f $O/x264*
ls -l $O
