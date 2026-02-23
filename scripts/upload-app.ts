/**
 * Upload APK/IPA to BrowserStack App Automate.
 *
 * Usage:
 *   ts-node scripts/upload-app.ts android ./apps/flexbets.apk
 *   ts-node scripts/upload-app.ts ios     ./apps/FlexBets.ipa
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BS_USER = process.env.BROWSERSTACK_USERNAME!;
const BS_KEY = process.env.BROWSERSTACK_ACCESS_KEY!;
const BS_UPLOAD_URL = 'https://api-cloud.browserstack.com/app-automate/upload';

interface UploadResponse {
  app_url: string;
  custom_id: string;
  shareable_id: string;
}

async function uploadApp(platform: string, appPath?: string): Promise<void> {
  // Default paths
  const defaultPaths: Record<string, string> = {
    android: './apps/flexbets-staging.apk',
    ios: './apps/FlexBets-staging.ipa',
  };

  const filePath = appPath || defaultPaths[platform];

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`❌ App file not found: ${filePath}`);
    console.error(`   Place your ${platform === 'android' ? 'APK' : 'IPA'} in the ./apps/ directory`);
    process.exit(1);
  }

  console.log(`📱 Uploading ${platform} app: ${filePath}`);
  console.log(`   Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);

  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, path.basename(filePath));
    formData.append('custom_id', `FlexBets-${platform}-${Date.now()}`);

    const response = await axios.post<UploadResponse>(BS_UPLOAD_URL, formData, {
      auth: { username: BS_USER, password: BS_KEY },
      headers: { 'Content-Type': 'multipart/form-data' },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { app_url, custom_id } = response.data;

    console.log(`\n✅ Upload successful!`);
    console.log(`   App URL:   ${app_url}`);
    console.log(`   Custom ID: ${custom_id}`);
    console.log(`\n📋 Add this to your .env file:`);

    if (platform === 'android') {
      console.log(`   BROWSERSTACK_ANDROID_APP_URL=${app_url}`);
    } else {
      console.log(`   BROWSERSTACK_IOS_APP_URL=${app_url}`);
    }
  } catch (error: any) {
    console.error(`❌ Upload failed:`, error.response?.data || error.message);
    process.exit(1);
  }
}

// ── CLI Entry ─────────────────────────────────────────────────────
const [platform, appPath] = process.argv.slice(2);

if (!platform || !['android', 'ios'].includes(platform)) {
  console.error('Usage: ts-node scripts/upload-app.ts <android|ios> [path-to-app]');
  process.exit(1);
}

uploadApp(platform, appPath);
