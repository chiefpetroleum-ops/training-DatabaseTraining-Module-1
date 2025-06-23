# Deploying to Vercel

This guide will walk you through deploying your Database Training application to Vercel.

## Prerequisites

1. A Vercel account (you mentioned you have a Pro account)
2. Vercel CLI installed (optional, but recommended)
3. Git installed (optional, but recommended for version control)

## Deployment Options

### Option 1: Direct Import from GitHub (Recommended)

1. Push your code to a GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/database-training.git
   git push -u origin main
   ```

2. Log in to your Vercel account
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Configure your project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: Leave blank (no build needed)
   - Output Directory: ./
6. Click "Deploy"

### Option 2: Using Vercel CLI (For advanced users)

1. Install Vercel CLI if you haven't already:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel from your terminal:
   ```
   vercel login
   ```

3. Navigate to your project directory:
   ```
   cd path/to/database-training
   ```

4. Deploy your project:
   ```
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy: Y
   - Select scope: Your account or team
   - Link to existing project: N
   - Project name: database-training (or any name you prefer)
   - Directory: ./

6. For production deployment:
   ```
   vercel --prod
   ```

## After Deployment

After successful deployment, Vercel will provide you with a URL for your application (typically something like `database-training.vercel.app`).

## Making Updates

To update your application after making changes:

1. Commit your changes to GitHub, and Vercel will automatically redeploy (if using Option 1)
2. Or run `vercel --prod` again (if using Option 2)

## Custom Domain (With Vercel Pro)

With your Pro account, you can set up a custom domain:

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS

## Troubleshooting

If you encounter any issues:

1. Check the build logs in Vercel
2. Ensure all file paths are correct (case-sensitive)
3. Verify that the `vercel.json` configuration is correct
4. Contact Vercel support if needed (available with your Pro account)
