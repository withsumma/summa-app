# Summa Development Log

A running log of changes, problems encountered, and solutions that worked.

---

## 2026-05-03

### Changes
- Wired "Start with Summa" hero button to navigate directly to Sign Up screen (previously showed pre-alpha modal)
- Reconnected Vercel ↔ GitHub webhook (was disconnected, preventing auto-deploys)

### Problems & Solutions

**Vercel not deploying after push**
- Cause: The GitHub ↔ Vercel webhook had become disconnected
- Fix: Reconnected in Vercel project Settings → Git, then triggered manual redeploy from Deployments tab (three-dot menu → Redeploy)

**Git lock file blocking commits in GitHub Desktop**
- Error: "A lock file already exists in the repository, which blocks this operation from completing"
- Cause: Likely triggered by rolling back a deployment on Vercel while GitHub Desktop was open
- Fix: Navigate to the repo in Finder (Repository → Show in Finder in GitHub Desktop), show hidden files (Cmd+Shift+.), open `.git` folder, delete `index.lock` and `.git/objects/maintenance.lock`

**Broken images on live site (prior session)**
- Cause: Figma MCP asset URLs are temporary (~7 days) and expired
- Fix: Replaced with permanent local image files in `public/assets/home/`

### Learnings
- Vercel rollbacks can cause git lock file conflicts with GitHub Desktop — always close GitHub Desktop before rolling back on Vercel, or be prepared to delete lock files
- Figma MCP asset URLs expire — always download and commit images locally rather than referencing Figma CDN URLs
- If Vercel stops auto-deploying, first check Settings → Git for webhook connection status
- Manual redeploy: Deployments tab → three-dot menu on any deployment → Redeploy
