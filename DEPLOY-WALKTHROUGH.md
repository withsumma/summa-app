# Summa — Deploy Walkthrough (for non-devs)

This guide will take you from "folder on my computer" to "live website with a real database."

Think of it in 3 layers — like designing a building:

| Layer | Tool | What it does | Analogy |
|-------|------|-------------|---------|
| **Code storage** | GitHub | Saves your code and tracks every change | Google Drive for code |
| **Hosting** | Vercel | Turns your code into a live website | Squarespace, but for apps |
| **Database** | Supabase | Stores fund data, donations, user info | A spreadsheet in the cloud that your app can read/write |

---

## STEP 1: Create a Supabase project (your database)

**What this does:** Creates a hosted database where fund and donation data will be stored. When someone creates a fund or records a payment, it saves to this database. When a supporter visits a fund URL, the app reads from this database.

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Name it **summa** (or whatever you'd like)
4. Choose a **database password** — save this somewhere (you won't need it often, but don't lose it)
5. Choose a **region** close to you (e.g., East US)
6. Click **"Create new project"** and wait ~1 minute for it to provision

### Create your database tables

7. In the left sidebar, click **"SQL Editor"** (it looks like a terminal icon)
8. Open the file `supabase-schema.sql` that's in your summa-app folder
9. **Select all** the text in that file and **paste** it into the SQL Editor
10. Click **"Run"** (or press Cmd+Enter)
11. You should see "Success. No rows returned" — that means your tables were created!

### Verify it worked

12. In the left sidebar, click **"Table Editor"**
13. You should see two tables: **funds** and **contributions**
14. Click on each to confirm they exist (they'll be empty — that's expected!)

### Get your API keys

15. In the left sidebar, click **"Settings"** (gear icon) → then **"API"** in the submenu
16. You'll see two important values:
    - **Project URL** — looks like `https://abcdefg.supabase.co`
    - **anon public key** — a long string starting with `eyJ...`
17. **Copy both of these** — you'll need them in Step 3

> **What are these keys?** The Project URL is your database's address on the internet. The anon key is like a "guest pass" — it lets your app read/write data, but only within the rules you defined in the SQL schema (the Row Level Security policies).

---

## STEP 2: Push your code to GitHub

**What this does:** Uploads your project to GitHub so that Vercel can access it and automatically rebuild your site whenever you make changes.

### Option A: Using GitHub Desktop (easiest for designers)

1. Download [GitHub Desktop](https://desktop.github.com/) if you don't have it
2. Sign in with your GitHub account
3. Go to **File → Add Local Repository**
4. Navigate to the `summa-app` folder in your Summa folder and select it
5. It will say "this is not a git repository" — click **"Create a Repository"**
6. Name: **summa-app**, Description: "Summa fund setup MVP"
7. Make sure **"Initialize with a README"** is unchecked
8. Click **"Create Repository"**
9. You'll see all your files listed as changes. Click **"Commit to main"**
10. Click **"Publish repository"** in the top bar
11. Uncheck "Keep this code private" if you want it public, then click **"Publish"**

### Option B: Using the terminal (if you're comfortable)

```bash
cd path/to/summa-app
git init
git add .
git commit -m "Initial commit: Summa fund setup MVP"
gh repo create summa-app --public --source=. --push
```

> **What just happened?** Your code is now on GitHub at `github.com/YOUR_USERNAME/summa-app`. Think of it as a backup that also lets other tools (like Vercel) access your code.

---

## STEP 3: Deploy to Vercel

**What this does:** Vercel takes your code from GitHub, builds it into a website, and hosts it on a URL. Every time you push new code to GitHub, Vercel automatically rebuilds and redeploys — like magic.

1. Go to [vercel.com](https://vercel.com) and sign in with your **GitHub account**
2. Click **"Add New..."** → **"Project"**
3. Find **summa-app** in the list of your GitHub repos and click **"Import"**
4. Vercel will auto-detect that it's a Vite project — you'll see:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
   - Leave all of these as-is!

### Add your Supabase keys

5. **Before clicking Deploy**, expand the **"Environment Variables"** section
6. Add two variables (using the values you copied from Supabase in Step 1):

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://abcdefg.supabase.co` (your Project URL) |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (your anon public key) |

7. Click **"Deploy"**
8. Wait ~30 seconds — Vercel will show a success screen with confetti!
9. Your site is now live at something like **summa-app.vercel.app**

> **Why environment variables?** Your Supabase keys are like a password to your database. You don't want them saved in your code (which is public on GitHub). Environment variables let Vercel know the keys without them being visible in your code. The `VITE_` prefix is special — it tells Vite "it's okay to expose this to the browser."

---

## STEP 4: Test the full flow

1. Visit your live URL (e.g., `summa-app.vercel.app`)
2. Tap "Get started" and go through the fund creation flow
3. On the **"You're all set!"** screen, you should see a shareable URL like:
   `summa-app.vercel.app/fund/help-jason-recover-a3f2`
4. **Copy that URL** and open it in a **new browser tab** (or incognito)
5. You should land on the **supporter fund page** — with data loaded from Supabase!
6. Go through the contribution flow — pick amount, select Venmo, record payment
7. Check your Supabase **Table Editor → contributions** — you should see the new row!

---

## STEP 5 (optional): Add a custom domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type in your domain (e.g., `app.withsumma.com`)
3. Vercel will give you DNS records to add at your domain registrar
4. Once DNS propagates (~5 minutes), your site will be live on your custom domain

---

## How changes work going forward

Once this is set up, updating your site is simple:

1. Edit files in your `summa-app` folder
2. In GitHub Desktop: you'll see the changes listed → write a short description → click "Commit" → click "Push"
3. Vercel automatically detects the push and redeploys in ~30 seconds
4. Your live site is updated!

No FTP, no servers, no build commands to run manually. It's all automatic.

---

## Glossary of terms you'll see

| Term | What it means |
|------|---------------|
| **Repository (repo)** | A folder of code tracked by Git — like a project folder with undo history |
| **Commit** | A saved snapshot of your changes — like "Save As" with a description |
| **Push** | Upload your commits from your computer to GitHub |
| **Deploy** | Take code and turn it into a live website |
| **Environment variable** | A secret value (like a password) stored outside your code |
| **Build** | The process of converting your JSX/React code into plain HTML/JS that browsers understand |
| **Slug** | A URL-friendly version of text — "Help Jason Recover" becomes `help-jason-recover` |
| **Row Level Security (RLS)** | Database rules that control who can read/write what data |
| **Anon key** | A "guest pass" for your database — allows public read/write within your RLS rules |
