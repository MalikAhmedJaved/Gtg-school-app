# Quick Setup: Create GitHub Repository

## Step 1: Remove Git Lock (if exists)
If you get permission errors, first remove any lock files:
```bash
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
```

## Step 2: Stage All Files
```bash
git add .
```

## Step 3: Create Initial Commit
```bash
git commit -m "Initial commit: Cleaning Service Mobile App - React Native with Expo"
```

## Step 4: Create Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `cleaning-service-mobile-app` (or your preferred name)
3. **Description**: "Mobile app for Cleaning Service - React Native with Expo"
4. **Visibility**: Choose Public or Private
5. **Important**: Do NOT check "Add a README file" or "Add .gitignore" (we already have these)
6. Click **"Create repository"**

## Step 5: Connect and Push

After creating the repository, GitHub will show you commands. Run these:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/cleaning-service-mobile-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Complete Command Sequence

Copy and paste these commands one by one (replace YOUR_USERNAME):

```bash
# Navigate to project
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"

# Remove lock file if exists
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue

# Stage files
git add .

# Commit
git commit -m "Initial commit: Cleaning Service Mobile App - React Native with Expo"

# Add remote (REPLACE YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/cleaning-service-mobile-app.git

# Push
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI (`gh`) installed:

```bash
cd "B:\WorkSpace\Ahmed Workspace\Cleaning Website frontend only\mobile-app"
gh auth login
gh repo create cleaning-service-mobile-app --public --source=. --remote=origin --push
```

## Troubleshooting

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/cleaning-service-mobile-app.git
```

**"Permission denied"**
- Close any Git GUI applications (GitHub Desktop, SourceTree, etc.)
- Close VS Code or any IDE that might have Git open
- Try again

**Check if remote is set correctly:**
```bash
git remote -v
```
