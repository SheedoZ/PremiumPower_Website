#!/usr/bin/env bash
# Downloads the tools the showreel renderer needs into showreel/.cache:
# a static ffmpeg build (H.264 + AAC) and the typefaces used on screen.
# Everything comes from GitHub release assets. Run once before render.cjs.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="$HERE/.cache"
TMP="$CACHE/dl"
mkdir -p "$CACHE/fonts" "$TMP"

get() { curl -fsSL --retry 3 -o "$2" "$1"; }

if [ ! -x "$CACHE/ffmpeg" ]; then
  echo "ffmpeg"
  get https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64.gz "$TMP/ffmpeg.gz"
  gunzip -c "$TMP/ffmpeg.gz" > "$CACHE/ffmpeg"
  chmod +x "$CACHE/ffmpeg"
fi

echo "fonts"
get https://github.com/theleagueof/league-gothic/releases/download/1.601/LeagueGothic-1.601.zip "$TMP/league.zip"
get https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip "$TMP/inter.zip"
get https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip "$TMP/jbm.zip"
get "https://github.com/IBM/plex/releases/download/%40ibm%2Fplex-sans-arabic%401.1.0/ibm-plex-sans-arabic.zip" "$TMP/plex-ar.zip"

python3 - "$TMP" "$CACHE/fonts" <<'EOF'
import os, sys, zipfile
tmp, out = sys.argv[1], sys.argv[2]
want = {
    "league.zip": ["LeagueGothic-1.601/static/WOFF2/LeagueGothic-Regular.woff2"],
    "inter.zip": ["extras/ttf/Inter-Medium.ttf", "extras/ttf/Inter-SemiBold.ttf",
                  "extras/ttf/Inter-Bold.ttf", "extras/ttf/InterDisplay-Black.ttf"],
    "jbm.zip": ["fonts/webfonts/JetBrainsMono-Regular.woff2", "fonts/webfonts/JetBrainsMono-Medium.woff2",
                "fonts/webfonts/JetBrainsMono-Bold.woff2"],
    "plex-ar.zip": ["ibm-plex-sans-arabic/fonts/complete/woff2/IBMPlexSansArabic-Bold.woff2"],
}
for name, files in want.items():
    with zipfile.ZipFile(os.path.join(tmp, name)) as z:
        for f in files:
            with open(os.path.join(out, os.path.basename(f)), "wb") as fh:
                fh.write(z.read(f))
EOF

rm -rf "$TMP"
echo "done: $CACHE"
