#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/dist"
SUITE_ROOT="$OUT_DIR/maestro_suite"

rm -rf "$SUITE_ROOT"
mkdir -p "$SUITE_ROOT"

# Copy all maestro assets under a single root folder
cp -R "$ROOT/maestro/." "$SUITE_ROOT/"

# Zip the single-root folder (BrowserStack requirement)
mkdir -p "$OUT_DIR"
(cd "$OUT_DIR" && zip -r "maestro_suite.zip" "maestro_suite" >/dev/null)

echo "Created: $OUT_DIR/maestro_suite.zip"
