# My Blog

Repository for my personal blog. Adapted from [AstroPaper](https://github.com/satnaing/astro-paper) theme

## Deployment

To deploy the site to GitHub Pages, follow these steps:

1. **Build the project:**
   ```bash
   bun run build
   ```
   This generates the static site in the `dist/` directory.

2. **Deploy the `dist/` folder to the `gh-pages` branch:**
   You can run the following command sequence to force-push the build output to GitHub:
   ```bash
   cd dist
   git init
   touch .nojekyll
   git add .
   git commit -m "Deploy to gh-pages"
   git remote add origin https://github.com/julius383/julius383.github.io
   git push origin main:gh-pages --force
   cd ..
   ```

*Note: The `.nojekyll` file is required to ensure GitHub Pages serves files from the `_astro` directory.*
