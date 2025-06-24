# Deploying to Vercel

This document provides instructions for deploying the Database Training Module to Vercel as an alternative to GitHub Pages.

## Steps to Deploy

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't already have one.

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login to Vercel from the command line:
   ```
   vercel login
   ```

4. Navigate to the project directory and run:
   ```
   vercel
   ```

5. Follow the prompts to configure your deployment:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: database-training-module-1 (or your preferred name)
   - Directory: ./ (root directory)
   - Override settings: No

6. Once deployed, Vercel will provide you with a URL for your application.

## Automatic Deployments

When you connect your GitHub repository to Vercel, it will automatically deploy changes when you push to the main branch.

To set up automatic deployments:

1. Go to the Vercel dashboard
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Configure the deployment settings
6. Click "Deploy"

## Custom Domain

To use a custom domain with your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Click "Settings" > "Domains"
3. Add your domain and follow the instructions to configure DNS settings

## Environment Variables

If needed, you can add environment variables in the Vercel dashboard under "Settings" > "Environment Variables".

## Troubleshooting

If you encounter any issues with the Vercel deployment:

1. Check the deployment logs in the Vercel dashboard
2. Ensure all paths in your code are relative, not absolute
3. Verify that the vercel.json configuration is correct
4. Make sure all required files are included in the repository 