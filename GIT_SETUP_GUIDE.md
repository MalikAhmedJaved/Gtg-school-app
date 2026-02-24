# Git Repository Setup Guide

## Step 1: Stage All Files
```bash
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
git add .
```

## Step 2: Create Initial Commit
```bash
git commit -m "Initial commit: Cleaning Service Mobile App"
```

## Step 3: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `cleaning-service-mobile-app` (or any name you prefer)
3. Description: "Mobile app for Cleaning Service - React Native with Expo"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 4: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cleaning-service-mobile-app.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/cleaning-service-mobile-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
# Login to GitHub
gh auth login

# Create repository and push in one command
gh repo create cleaning-service-mobile-app --public --source=. --remote=origin --push
```

## Quick Commands Summary

```bash
# Navigate to project directory
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Cleaning Service Mobile App"

# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## What's Included in .gitignore

The following are automatically excluded:
- `node_modules/` - Dependencies
- `.expo/` - Expo build files
- `*.log` - Log files
- Build artifacts and temporary files

## Troubleshooting

**If you get "remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**If you need to update remote URL:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**Check remote configuration:**
```bash
git remote -v
```
