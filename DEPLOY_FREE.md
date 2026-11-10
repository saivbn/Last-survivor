# Deploy Last Survivor for free

This is a static Vite + Three.js game. It does not need a backend or database for its current single-player features.

## Recommended: Cloudflare Pages with GitHub (automatic redeploys)

1. Create a free GitHub account if you do not already have one.
2. Create a **public** repository, for example `last-survivor-3d`.
3. Upload the contents of this project folder to the repository root. Make sure `package.json`, `index.html`, `src/`, and `README.md` are at the root (not nested inside another `last-survivor-3d/` folder).
4. Open the Cloudflare dashboard: https://dash.cloudflare.com/ and sign in / create a free account.
5. Open **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
6. Connect GitHub and select the `last-survivor-3d` repository.
7. Set these build options:

   - Framework preset: **Vite** (or **None**)
   - Production branch: `main`
   - Root directory: `/` (project root)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`

8. Select **Save and Deploy**. Cloudflare will build the project and give you a public `https://<project-name>.pages.dev` URL.
9. Every push to `main` will trigger a new production deployment. Other branches can get preview deployments.

## Alternative: direct upload (manual updates)

1. On Ubuntu, open a terminal in this project folder.
2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. In Cloudflare, go to **Workers & Pages** → **Create application** → **Pages** → **Direct Upload**.
4. Name the project and upload the generated `dist` folder (or a ZIP containing the contents of `dist`, not the source project).
5. Deploy. The site will be available at a `pages.dev` URL.

   Direct Upload projects cannot later be converted into Git-integrated projects. Choose Git integration if you want automatic deployments after code changes.

## Test locally before publishing

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0
```

Open the local preview URL printed by Vite. To test on a phone connected to the same Wi-Fi, use `http://YOUR-LAPTOP-IP:4173` (allow the port through your firewall if prompted).

## Important limitations

- Hosting is free within the provider's current free-plan limits; provider terms and quotas can change.
- This project is a local single-player prototype. Cloudflare Pages hosts the files; it does **not** add online multiplayer, accounts, matchmaking, saved cloud progress, or anti-cheat.
- Test on at least one desktop browser and one real phone before sharing widely. WebGL performance depends on the phone's GPU and browser.
