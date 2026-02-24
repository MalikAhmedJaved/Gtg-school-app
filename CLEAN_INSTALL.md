# Clean Installation Guide

There are version conflicts with the existing installation. Follow these steps to do a clean install:

## Step 1: Remove existing node_modules and lock files

```bash
# Remove node_modules folder
rmdir /s /q node_modules

# Remove package-lock.json if it exists
del package-lock.json
```

Or on PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```

## Step 2: Install Expo SDK 54 with legacy peer deps

```bash
npm install expo@~54.0.0 --legacy-peer-deps
```

## Step 3: Install all Expo packages

```bash
npx expo install --fix --legacy-peer-deps
```

## Step 4: Install remaining packages

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-svg-transformer react-native-vector-icons @react-native-picker/picker axios --legacy-peer-deps
```

## Alternative: Use yarn instead

If npm continues to have issues, try using yarn:

```bash
# Install yarn if you don't have it
npm install -g yarn

# Remove node_modules
rmdir /s /q node_modules

# Install with yarn
yarn install
```
