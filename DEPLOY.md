# Deploying to Vercel

This project is ready to be deployed to Vercel. Existing configuration files (`vercel.json`, `vite.config.ts`) have been prepared for smooth deployment.

## Prerequisites

-   A Vercel account ([vercel.com](https://vercel.com))
-   [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended)

## Option 1: Deploy via Vercel Dashboard (Recommended for Beginners)

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Log in to Vercel and click **"Add New..."** -> **"Project"**.
3.  Import your Git repository.
4.  Vercel will detect `Vite` as the framework. This is correct.
5.  **Environment Variables**: You MUST add the following environment variables in the "Environment Variables" section before deploying:
    -   `VITE_SUPABASE_URL`: (Copy from your `.env.local` file)
    -   `VITE_SUPABASE_ANON_KEY`: (Copy from your `.env.local` file)
    -   `GEMINI_API_KEY`: (Copy from `.env.local` if you use AI features)
6.  Click **"Deploy"**.

## Option 2: Deploy via CLI

1.  Install Vercel CLI globally:
    ```bash
    npm install -g vercel
    ```
2.  Log in:
    ```bash
    vercel login
    ```
3.  Deploy from the project root:
    ```bash
    vercel
    ```
4.  Follow the prompts:
    -   Set up and deploy? [Y]
    -   Which scope? (Select your team/user)
    -   Link to existing project? [N]
    -   Project name? (Press Enter or type a name)
    -   In which directory is your code located? `./`
    -   Auto-detected Project Settings (Vite)? [Y]
    -   Environment Variables:
        -   You can add them in the dashboard later or during prompt if CLI asks (usually handled via dashboard for secrets).
5.  To deploy to production (after verified preview):
    ```bash
    vercel --prod
    ```

## Post-Deployment Checks

-   Verify that routing works by navigating to different tabs (e.g., refreshing on a non-root route might redirect to root if not handled, but our `vercel.json` handles rewrites).
-   Check browser console for any Supabase connection errors (usually due to missing Env Vars).
