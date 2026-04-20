#!/bin/bash
# Generate Chrome extension icons from SVG
#Requires: rsvg-convert (part of librsvg) to be installed on the system `brew install librsvg`

SRC_SVG="docs/assets/icon.svg"
OUT_DIR="."
SIZES=(16 32 48 128)

for size in "${SIZES[@]}"; do
  rsvg-convert -w $size -h $size "$SRC_SVG" -o "$OUT_DIR/icon-$size.png"
done

echo "Icons generated: icon-16.png, icon-32.png, icon-48.png, icon-128.png"