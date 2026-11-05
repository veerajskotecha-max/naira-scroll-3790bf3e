#!/bin/bash
# finish_redo.sh (the product-only redos) <S>: mix, master, render at 4K (DPR 2) and encode both shapes (9:16 Reels/Stories, 4:5 Feed) for each ad.
S=$1; cd $S/ads
fin() {   # fin <build> <name> <ad1080> <ad4k> <br916> <br45>
  python3.13 -I tools/build_$1.py $S > /dev/null && python3.13 -I tools/audio6.py $S $3 score > /dev/null 2>&1 && bash tools/master.sh $3 mix_score master_score
  python3.13 -I tools/build_$1.py $S 2 > /dev/null && rm -rf out_$4 && node tools/render2.mjs $4 out_$4 | tail -1
  FPS=24 LEVEL=5.1 MAXRATE=24000k BUFSIZE=34000k bash tools/encode2.sh $4 final7/naira-$2-4k.mp4 $5 $3/master_score.wav
  FPS=24 MAXRATE=20000k BUFSIZE=30000k bash tools/encode45.sh $4 final7/naira-$2-4x5-feed.mp4 $6 $3/master_score.wav 230
  ls -la final7/naira-$2-*; rm -rf out_$4
}






fin p2b p2-verdant-studs-v2 p2b p2b_4k 15000k 11500k
fin p3b p3-baguette-necklace-v2 p3b p3b_4k 14000k 11000k
fin p4b p4-woven-gold-hoops-v2 p4b p4b_4k 13500k 10500k
fin p5b p5-halo-curve-ring-v2 p5b p5b_4k 14000k 11000k
fin tg1b t1-toggle-chain-blueprint tg1b tg1b_4k 14000k 11000k
fin tg2b t2-toggle-chain-three-slats tg2b tg2b_4k 14000k 11000k

echo ALL DONE
