#!/usr/bin/env bash
# Build web-optimized Lyrna UGC assets for the landing-page carousel.
# Source: /Users/deonmenezes/lyrna-ugc/final  (1080x1920 @30fps, H.264)
# Output: <web>/ugc/lyrna/video/{c1..c10,montage}.mp4 (720x1280, ~1.1Mbps, faststart)
#         <web>/ugc/lyrna/video/poster/{c1..c10,montage}.jpg (frame @1.5s)
set -euo pipefail
FF="${FF:-/opt/homebrew/bin/ffmpeg}"
SRC="/Users/deonmenezes/lyrna-ugc/final"
OUT="/Users/deonmenezes/Downloads/techscrolldatacach/techcrunch-articles-listing-by-keyword/ugc/lyrna/video"
POST="$OUT/poster"
mkdir -p "$OUT" "$POST"

enc() {  # $1 src basename (no ext)  $2 out basename
  local s="$SRC/$1.mp4" o="$OUT/$2.mp4" p="$POST/$2.jpg"
  [ -f "$s" ] || { echo "SKIP missing $s"; return 0; }
  echo ">> $2  (encode 720x1280)"
  "$FF" -y -v error -i "$s" \
    -vf "scale=720:1280:flags=lanczos" -r 30 \
    -c:v libx264 -profile:v high -crf 26 -preset veryfast -maxrate 1400k -bufsize 2800k \
    -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 96k -ac 2 "$o"
  echo ">> $2  (poster @1.5s)"
  "$FF" -y -v error -ss 1.5 -i "$s" -vf "scale=540:960:flags=lanczos" -frames:v 1 -q:v 3 "$p"
  echo "   done $2: $(du -h "$o" | cut -f1) video, $(du -h "$p" | cut -f1) poster"
}

for i in 1 2 3 4 5 6 7 8 9 10; do enc "lyrna_c$i" "c$i"; done
enc "lyrna_montage_v2" "montage"
echo "ALL UGC WEB ASSETS BUILT -> $OUT"
ls -lah "$OUT" "$POST"
