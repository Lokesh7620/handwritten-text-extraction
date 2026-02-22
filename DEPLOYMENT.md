# Deployment Instructions

This project is configured for auto-deployment to GitHub Pages using GitHub Actions.

## Setup Steps

1.  **Create a GitHub Repository:**
    *   Go to GitHub and create a new repository.
    *   Do **not** initialize it with a README or .gitignore (we already have those).

2.  **Push Your Code:**
    *   Open your terminal in the project directory.
    *   Run the following commands (replace `<your-username>` and `<your-repo-name>`):
        ```powershell
        git remote add origin https://github.com/<your-username>/<your-repo-name>.git
        git branch -M master
        git push -u origin master
        ```

3.  **Configure GitHub Secrets:**
    *   In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
    *   Click **New repository secret**.
    *   **Name:** `VITE_GEMINI_API_KEY`
    *   **Value:** Paste your Gemini API key (from your `.env.local` file).

4.  **Enable GitHub Pages:**
    *   Go to **Settings > Pages**.
    *   Under **Build and deployment > Source**, ensure **GitHub Actions** is selected.

## How it Works

Every time you push changes to the `master` branch, the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow will:
1.  Install dependencies.
2.  Build the project (injecting the `VITE_GEMINI_API_KEY` secret).
3.  Deploy the generated `dist` folder to GitHub Pages.
