# Reanimated Fix

I've downgraded `react-native-reanimated` to v3 which doesn't require `react-native-worklets-core`.

## Installation

Run:

```bash
npm install react-native-reanimated@~3.16.1 --legacy-peer-deps
```

Or use Expo's install:

```bash
npx expo install react-native-reanimated@~3.16.1
```

## Why v3?

- Reanimated v4 requires `react-native-worklets-core` which has version compatibility issues
- Reanimated v3 works perfectly with drawer navigation and doesn't need worklets
- v3 is stable and widely used

## After Installation

Restart Metro bundler:

```bash
npm start -- --reset-cache
```

The drawer navigation will work with smooth animations using Reanimated v3.
