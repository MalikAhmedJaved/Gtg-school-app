# Troubleshooting Mobile App Errors

If you're seeing errors on your mobile device, here are common fixes:

## Common Issues and Solutions

### 1. SVG Logo Not Displaying
- **Fix**: The Logo component now has a fallback emoji if SVG fails
- The app will show a cleaning emoji (🧹) if the SVG can't load

### 2. Image Loading Errors
- **Fix**: Added error handling for remote images
- Images will fail gracefully without crashing the app

### 3. Picker Component Issues
- **Fix**: Added `mode="dropdown"` to all Picker components
- This ensures proper rendering on Android

### 4. Navigation Errors
- **Fix**: Added ErrorBoundary to catch navigation errors
- The app will show an error screen instead of crashing

### 5. Missing Translations
- **Fix**: All translation keys have fallback English text
- The app will always show something even if translations are missing

## Debugging Steps

1. **Check the Metro bundler logs** - Look for red error messages
2. **Check device logs** - Use `adb logcat` for Android or Xcode console for iOS
3. **Enable remote debugging** - Shake device and select "Debug" in Expo Go

## Common Error Messages

### "Cannot read property 'X' of undefined"
- Usually means a component is trying to access a prop/state that doesn't exist
- Check the ErrorBoundary component for details

### "Network request failed"
- Check your internet connection
- API URLs might be incorrect in `src/utils/api.js`

### "Module not found"
- Run `npm install` again
- Clear cache: `npm start -- --reset-cache`

## Getting Detailed Error Info

To see the actual errors on your phone:

1. **In Expo Go**: Shake your device → "Show Developer Menu" → "Debug Remote JS"
2. **Check console**: Open Chrome DevTools (if debugging enabled)
3. **Check logs**: Look at the terminal where `npm start` is running

## Quick Fixes

```bash
# Clear all caches and reinstall
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
npm start -- --reset-cache
```

If errors persist, please share:
1. The exact error message from your phone
2. Which screen/action triggers the error
3. Any red error messages from the Metro bundler terminal
