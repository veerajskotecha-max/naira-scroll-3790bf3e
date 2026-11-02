#!/bin/bash
# voices.sh <S>: the two creators' voices, as vo/ana.48k.wav and vo/lvv.48k.wav (mono float).
# - ana: her raw draft has no music, only room hiss, so it gets a light denoise.
# - lvv: CapCut laid a song under her voice ~22 dB down; Demucs (htdemucs_ft, two stems) lifts the voice off it, so the
#   paid cut can carry our own cleared score instead of a song Meta may mute. Needs CPU torch + demucs installed with
#   pip --user (pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio; pip install demucs).
S=$1; A=$S/ads/new/aud; P=$S/ads/new/sep; mkdir -p $A $P $S/vo
ffmpeg -nostdin -v error -y -i $S/dl/new/ananaya_raw/raw.mp4 -vn -ar 48000 $A/araw48.wav
ffmpeg -nostdin -v error -y -i $S/dl/new/lv0/lv0.mp4 -vn -ar 48000 $A/lv48.wav
cp $A/lv48.wav $P/lv48.wav
(cd $P && python3.13 -c "import sys; sys.path.append('/root/.local/lib/python3.13/site-packages'); sys.argv=['demucs','-n','htdemucs_ft','--two-stems','vocals','-o','out','--float32','lv48.wav']; from demucs.separate import main; main()")
ffmpeg -nostdin -v error -y -i $A/araw48.wav -af "highpass=f=70,afftdn=nr=16:nf=-50:tn=1" -ac 1 -ar 48000 -c:a pcm_f32le $S/vo/ana.48k.wav
ffmpeg -nostdin -v error -y -i $P/out/htdemucs_ft/lv48/vocals.wav -af "highpass=f=70,aresample=48000:resampler=soxr" -ac 1 -c:a pcm_f32le $S/vo/lvv.48k.wav
