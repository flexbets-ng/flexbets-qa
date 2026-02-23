#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/bs-maestro-run.sh android path/to/app.apk
#   ./scripts/bs-maestro-run.sh ios path/to/app.ipa

PLATFORM="${1:-}"
APP_FILE="${2:-}"

if [[ -z "$PLATFORM" || -z "$APP_FILE" ]]; then
  echo "Usage: $0 <android|ios> <path-to-app.(apk|ipa)>"
  exit 1
fi

: "${BROWSERSTACK_USERNAME:?Missing BROWSERSTACK_USERNAME}"
: "${BROWSERSTACK_ACCESS_KEY:?Missing BROWSERSTACK_ACCESS_KEY}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIP_PATH="$ROOT/dist/maestro_suite.zip"
AUTH="${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}"

PROJECT="${BS_PROJECT:-FlexBets_QA}"
BUILD_TAG="${BS_BUILD_TAG:-manual}"
EXECUTE_PATH="${BS_EXECUTE:-flows/smoke}"  # default: run smoke folder

# Build suite zip
"$ROOT/scripts/zip-maestro-suite.sh"

echo "Uploading app..."
APP_URL=$(curl -s -u "$AUTH" \
  -X POST "https://api-cloud.browserstack.com/app-automate/maestro/v2/app" \
  -F "file=@${APP_FILE}" \
  -F "custom_id=${PROJECT}_${PLATFORM}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["app_url"])')

echo "App URL: $APP_URL"

echo "Uploading test suite..."
SUITE_URL=$(curl -s -u "$AUTH" \
  -X POST "https://api-cloud.browserstack.com/app-automate/maestro/v2/test-suite" \
  -F "file=@${ZIP_PATH}" \
  -F "custom_id=${PROJECT}_suite" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["test_suite_url"])')

echo "Suite URL: $SUITE_URL"

if [[ "$PLATFORM" == "android" ]]; then
  BUILD_ENDPOINT="https://api-cloud.browserstack.com/app-automate/maestro/v2/android/build"
  DEVICES_JSON="${BS_DEVICES_ANDROID:-[\"Google Pixel 7-13.0\",\"Samsung Galaxy S22-12.0\"]}"
elif [[ "$PLATFORM" == "ios" ]]; then
  BUILD_ENDPOINT="https://api-cloud.browserstack.com/app-automate/maestro/v2/ios/build"
  DEVICES_JSON="${BS_DEVICES_IOS:-[\"iPhone 15-17\"]}"
else
  echo "Platform must be android or ios"
  exit 1
fi

echo "Starting build..."
RESP=$(curl -s -u "$AUTH" \
  -X POST "$BUILD_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"app\": \"${APP_URL}\",
    \"testSuite\": \"${SUITE_URL}\",
    \"project\": \"${PROJECT}\",
    \"buildTag\": \"${BUILD_TAG}\",
    \"execute\": [\"${EXECUTE_PATH}\"],
    \"devices\": ${DEVICES_JSON}
  }")

echo "$RESP" | python3 -c 'import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))'
echo
echo "Open BrowserStack App Automate dashboard to view results."
