# The Cover — a reel cover from the DP frame

The brief: a reel cover in the format of the round-2 ad "The Cover", from the best frame of the shoot. It has to work in the
feed and the profile grid as well as full screen. The output is a 1080x1920 JPEG plus a sheet of the three crops Instagram
shows. The frame is not in git.

## The frame

62379666 at 4.00 s (frame 120): the 10/10 DP chosen in `kinn-films` (see "The DP" in its README). It is decoded with the
source's own BT.709 full-range matrix. There is no filter and no grade, and she is the original pixels throughout.

## Layout

The Cover's parts are unchanged:
- the NAIRA masthead from `kinn-films/img/logo_sage.svg`, letters in The Cover's #5E8279, the blush flower as the I;
- the issue line;
- the thin ivory border;
- the kick line and the italic price headline, in deep sage with the ivory "print" glow;
- the blush sticker.

Only the positions change, to fit a tight portrait:

- **Crop safety.** Instagram shows a reel cover three ways: full 9:16 in the Reels tab, the centre 4:5 in the feed
  (y 285–1635) and the centre 3:4 in the profile grid (y 240–1680). Everything sits inside the border (y 300–1606), so all
  three views carry the whole cover.
- **Why she moves down 300 px.** In the frame her crown is at y 255. The first draft put the masthead behind her head, as the
  ad does, and it read "NA…RA" with the flower hidden. To fit the cover lines on the white wall to her left, as in the ad,
  she needs about 300 px clear above her. That puts her eyes at 57% of the feed crop.
- **Headline size.** Measured against her hair edge from the matte, an 80 px headline ends at her flyaways. At the ad's 96 px,
  "1,499" would cross her hair.
- **Rejected layout.** Keeping her higher and putting the cover lines over her shoulder did not read: the text sat on skin
  and brocade.

## The 300 px above the frame (`tools/fill_top.py`)

Only wall and curtain above the frame's top edge are made; nothing on her is.

- **Brick wallpaper.** Each column repeats its own two courses upward: 279 px at the left down to 217 px at the edge,
  measured by NCC on the visible wall. The repeat shrinks to the right because the wall recedes. One course would mismatch
  the staggered joints. Seams are min-cut.
- **Plain wall above the wallpaper.** The wallpaper's top edge is a line fitted on the visible beige wedge (max residual
  4 px). Above it the wall takes its own colour per column, with a plateau to the left and matching grain.
- **Curtain.** It is extended in two upward passes of its own texture, with source rows chosen by seam error. Each pass is
  shifted sideways per column so its folds meet the real ones (they lean up to 9 px over 150 rows). Seams are min-cut. The
  dark edge band gets a steady profile so flecks do not repeat up it.

The first draft mirrored the top rows instead, which put a beige V over her head.

## Prices

Checked live on 15 Oct: Woven Gold Hoops are ₹1,499 with compare-at ₹2,769, which is 46% off (45.9%). If Shopify changes,
change `spec.json`.

## Run

```
python3 -I tools/frame.py <S> <work>              # dp_1080.png + her_cut.png (S/ffmpeg, S/v14/dl/62379666, S/v14/models)
python3 -I tools/fill_top.py <work>/dp_1080.png <work>/her_cut.png 300 <work>/bg.png <work>/her.png
python3 -I tools/page.py spec.json ../kinn-films/img/logo_sage.svg <S>/fonts <work> <work>/cover.html
node tools/shot.mjs <work>/cover.html <work>/cover.png
python3 -I tools/export.py <work>/cover.png <out> <S>/fonts
```

Rerun from this folder on 15 Oct, it reproduced the delivered cover to the pixel. To post it: upload the reel, then
Edit cover → Add from camera roll → `naira-reel-cover.jpg`.
