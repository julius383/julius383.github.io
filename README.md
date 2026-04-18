# My Blog

Repository for my personal blog. Adapted from [AstroPaper](https://github.com/satnaing/astro-paper) theme

## Deployment

To deploy the site to GitHub Pages, simply run:

```bash
bun run deploy
```

This script automates the following:
1. Builds the project (`bun run build`).
2. Navigates into the `dist/` directory.
3. Creates a `.nojekyll` file.
4. Initializes a temporary Git repository.
5. Commits and force-pushes the build output to the `gh-pages` branch.
