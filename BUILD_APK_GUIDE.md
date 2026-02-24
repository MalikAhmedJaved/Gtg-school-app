# How to Build APK for Cleaning Service Mobile App

## Prerequisites
1. **Expo Account** (free account works)
   - Sign up at https://expo.dev if you don't have an account

2. **EAS CLI** (Expo Application Services)
   - Install globally: `npm install -g eas-cli`

## Step-by-Step Instructions

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Enter your Expo account credentials.

### Step 3: Configure EAS (if needed)
```bash
eas build:configure
```
This will create/update the `eas.json` file (already created for you).

### Step 4: Build APK for Android

**Option A: Build APK directly (Recommended)**
```bash
eas build --platform android --profile preview
```

**Option B: Build production APK**
```bash
eas build --platform android --profile production
```

### Step 5: Download the APK
- The build will run on Expo's servers (takes 10-20 minutes)
- You'll get a link to download the APK when it's ready
- You can also check build status at: https://expo.dev/accounts/[your-username]/projects/cleaning-service-mobile/builds

## Alternative: Local Build (Advanced)

If you want to build locally on your machine:

1. **Install Android Studio** and set up Android SDK
2. **Set ANDROID_HOME** environment variable
3. Build locally:
```bash
eas build --platform android --profile preview --local
```

## Build Profiles Explained

- **preview**: Creates an APK for testing (internal distribution)
- **production**: Creates an APK for production release
- **development**: For development builds with development client

## Notes

- First build may take longer (15-20 minutes)
- Subsequent builds are faster (5-10 minutes)
- APK file size will be around 30-50 MB
- The APK can be installed directly on Android devices

## Troubleshooting

If you encounter errors:
1. Make sure you're logged in: `eas whoami`
2. Check your app.json configuration
3. Ensure all dependencies are installed: `npm install`
4. Check build logs on Expo dashboard

## Quick Commands Reference

```bash
# Login
eas login

# Check login status
eas whoami

# Build APK
eas build --platform android --profile preview

# Check build status
eas build:list

# View build details
eas build:view
```
