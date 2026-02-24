# Installation Instructions

Due to version conflicts, please follow these steps to install dependencies correctly:

## Step 1: Install Expo SDK 54

```bash
npm install expo@~54.0.0
```

## Step 2: Install all Expo packages using Expo's install command

This ensures all packages are compatible with SDK 54:

```bash
npx expo install expo-status-bar expo-linear-gradient expo-image-picker react react-native react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-svg @react-native-async-storage/async-storage
```

## Step 3: Install remaining packages

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-svg-transformer react-native-vector-icons @react-native-picker/picker axios
```

## Alternative: One-step installation

If the above doesn't work, try:

```bash
# First install expo
npm install expo@~54.0.0

# Then use expo install for all expo packages
npx expo install --fix

# Then install the rest
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-svg-transformer react-native-vector-icons @react-native-picker/picker axios
```

## Verify Installation

After installation, verify everything is correct:

```bash
npx expo-doctor
```

This will check for any version mismatches and suggest fixes.
