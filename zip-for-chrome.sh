#!/bin/bash
# zip-for-chrome.sh
# Zips only the necessary files for Chrome Web Store publication

ZIP_NAME="bulk-checkbox-checker.zip"
INCLUDE_FILES=(
  "manifest.json"
  "background.js"
  "content.js"
  "popup.html"
  "popup.js"
  "cc-styles.css"
)

# Remove old zip if exists
rm -f "$ZIP_NAME"

# Add files and folders
zip -r "$ZIP_NAME" ${INCLUDE_FILES[@]}

echo "Created $ZIP_NAME with required extension files."
