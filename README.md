# flexbets-qa

End-to-end mobile QA for FlexBets using **Maestro** executed on **BrowserStack App Automate**.

This repo:
- does **not** build the app
- runs tests against a provided **Android APK** and **iOS IPA**
- keeps smoke tests small and deterministic

## One-time setup

### 1) Create your local env file
```bash
cp .env.example .env
# edit .env with BrowserStack creds + test user creds

