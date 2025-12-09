# How to Push to GitHub - Step by Step Guide

## Step 1: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `domufi` (or your preferred name)
   - **Description**: "Tokenized Real Estate Investment Platform"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have files)
   - **DO NOT** add .gitignore or license (we already have them)
5. Click **"Create repository"**

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

### If you haven't committed yet:

```bash
git add .
git commit -m "Initial commit: Domufi platform"
git branch -M main
git remote add origin https://github.com/splashxmoon/domufi_platform.git
git push -u origin main
```

### If you already have commits:

```bash
git branch -M main
git remote add origin https://github.com/splashxmoon/domufi_platform.git
git push -u origin main
```

**Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.**

## Step 3: Verify the Push

1. Go to your GitHub repository page
2. You should see all your files there
3. The README.md should be visible on the main page

## Step 4: Future Updates

Whenever you make changes, use these commands:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Troubleshooting

### If you get "remote origin already exists" error:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### If you need to authenticate:

GitHub may ask for authentication. Use:
- **Personal Access Token** (recommended) - Create one at: Settings > Developer settings > Personal access tokens
- Or use GitHub CLI: `gh auth login`

### If you want to use SSH instead of HTTPS:

```bash
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Quick Command Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Check remote URL
git remote -v

# View commit history
git log --oneline
```

