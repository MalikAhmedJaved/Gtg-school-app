# Mobile App Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

## Important Notes

### SVG Logo
The logo SVG file has been copied to `assets/logo.svg`. The app uses `react-native-svg` to render it.

### Colors
The app uses the exact same color scheme as the web app:
- Primary (Teal): `#2c7a7b`
- Secondary (Green): `#38a169`

These colors are defined in `src/constants/theme.js` and match the SVG logo colors.

### API Configuration
Update the API base URL in `src/utils/api.js` to point to your backend server.

### Missing Dependencies
If you encounter any missing dependencies, install them:
```bash
npm install <package-name>
```

### Platform-Specific Notes

**iOS:**
- Requires Xcode (Mac only)
- Run `npm run ios` after starting the server

**Android:**
- Requires Android Studio
- Run `npm run android` after starting the server

**Web:**
- Can run in browser
- Run `npm run web` after starting the server

## All Screens Implemented

✅ **Main Screens:**
- HomePage
- Services (with Private, Commercial, Move-in/Move-out detail pages)
- About
- Contact
- Careers

✅ **Authentication:**
- Login
- Register

✅ **Dashboards:**
- Client Dashboard
- Admin Dashboard
- Cleaner Dashboard

All screens match the web application's functionality and design, adapted for mobile with React Native components.
