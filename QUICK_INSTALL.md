# Quick Installation Guide

Since there's no existing installation, follow these steps:

## Step 1: Install Expo SDK 54

```bash
npm install expo@~54.0.0 --legacy-peer-deps
```

## Step 2: Install all required Expo packages

```bash
npx expo install expo-status-bar expo-linear-gradient expo-image-picker react react-native react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-svg @react-native-async-storage/async-storage
```

## Step 3: Install remaining packages

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-svg-transformer react-native-vector-icons @react-native-picker/picker axios --legacy-peer-deps
```

## Step 4: Verify installation

```bash
npx expo-doctor
```

## If you get errors, try this alternative:

```bash
# Install expo first
npm install expo@~54.0.0 --legacy-peer-deps

# Then let expo install everything else
npx expo install --fix
```
