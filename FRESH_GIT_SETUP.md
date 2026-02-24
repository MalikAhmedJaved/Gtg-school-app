# Fresh Git Setup - Step by Step

## Step 1: Initialize Git
```bash
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
git init
```

## Step 2: Configure Your Identity
```bash
git config user.name "MalikAhmedJaved"
git config user.email "malikahmedjaved882@gmail.com"
```

## Step 3: Create .gitignore File
```bash
# Create .gitignore with these contents:
node_modules/
.expo/
.expo-shared/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.DS_Store
*.log
*.tmp
```

Or create it manually with these contents.

## Step 4: Stage All Files
```bash
git add .
```

## Step 5: Create Initial Commit
```bash
git commit -m "Initial commit: Cleaning Service Mobile App - React Native with Expo"
```

## Step 6: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `cleaning-service-mobile-app`
3. Description: "Mobile app for Cleaning Service - React Native with Expo"
4. Choose Public or Private
5. **DO NOT** check "Add a README file" or "Add .gitignore"
6. Click "Create repository"

## Step 7: Add Remote and Push

```bash
# Add remote
git remote add origin https://github.com/MalikAhmedJaved/cleaning-service-mobile-app.git

# Rename branch to main
git branch -M main

# Push to GitHub (you'll need Personal Access Token as password)
git push -u origin main
```

## When Prompted for Credentials:
- **Username**: `MalikAhmedJaved`
- **Password**: Use your GitHub Personal Access Token (not your password)
  - Create token at: https://github.com/settings/tokens
  - Select `repo` scope

## Complete Command Sequence (Copy & Paste)

```bash
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
git init
git config user.name "MalikAhmedJaved"
git config user.email "malikahmedjaved882@gmail.com"
git add .
git commit -m "Initial commit: Cleaning Service Mobile App - React Native with Expo"
git remote add origin https://github.com/MalikAhmedJaved/cleaning-service-mobile-app.git
git branch -M main
git push -u origin main
```
