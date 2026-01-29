# Deployment Guide

This guide covers deploying the Cornell Student Blog platform to production.

## Prerequisites

- GitHub repository: `https://github.com/okalmanwa/blogs.git`
- Supabase project (already set up)
- Supabase credentials (URL and Anon Key)

---

## Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications. It offers:
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Free tier available

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository: `okalmanwa/blogs`
4. Vercel will auto-detect Next.js

### Step 2: Configure Environment Variables

In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
- Go to your Supabase project dashboard
- Settings → API
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Configure Build Settings

Vercel will auto-detect these, but verify:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Option 2: Netlify

### Step 1: Connect Repository

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your repository: `okalmanwa/blogs`

### Step 2: Configure Build Settings

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18.x or 20.x

### Step 3: Add Environment Variables

Go to Site Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Deploy

Click **"Deploy site"** and wait for build completion.

---

## Option 3: Railway

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `okalmanwa/blogs`

### Step 2: Configure Environment Variables

In Railway dashboard → Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Configure Build

Railway auto-detects Next.js. Ensure:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

---

## Database Setup (Supabase)

### 1. Run SQL Migrations

Execute these SQL files in your Supabase SQL Editor (in order):

1. `create-profile-trigger.sql` - Auto-creates profiles on signup
2. `fix-profiles-rls.sql` - Sets up RLS policies for profiles
3. `fix-blog-posts-insert-rls.sql` - Sets up RLS for blog posts
4. `fix-comments-rls-final.sql` - Sets up RLS for comments
5. `fix-projects-rls.sql` - Sets up RLS for projects
6. `setup-storage-bucket.sql` - Creates storage bucket for images

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste the contents of each file
3. Click "Run"

### 2. Configure Storage Bucket

1. Go to Storage → Create bucket
2. Name: `blog-images` (or as configured in your code)
3. Make it **public** if you want images accessible without auth
4. Set up RLS policies for uploads

### 3. Set Up Email Auth

1. Go to Authentication → Settings
2. Configure email templates (optional)
3. Set site URL to your production domain
4. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/student/dashboard`
   - `https://your-domain.com/admin/dashboard`

---

## Post-Deployment Checklist

### ✅ Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

### ✅ Database
- [ ] All SQL migrations executed
- [ ] RLS policies are active
- [ ] Storage bucket created and configured
- [ ] Email auth redirect URLs configured

### ✅ Testing
- [ ] User registration works
- [ ] User login works
- [ ] Blog posts can be created
- [ ] Images can be uploaded
- [ ] Comments work
- [ ] Admin moderation works

### ✅ Security
- [ ] HTTPS is enabled (automatic on Vercel/Netlify)
- [ ] Environment variables are not exposed in client code
- [ ] RLS policies are properly configured
- [ ] CORS is configured (if needed)

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable missing"**
- Double-check environment variables in deployment platform
- Ensure `NEXT_PUBLIC_` prefix is correct

### Runtime Errors

**"Failed to fetch" or CORS errors**
- Check Supabase project URL is correct
- Verify Supabase project is active
- Check network tab for actual error

**"RLS policy violation"**
- Verify all SQL migrations ran successfully
- Check Supabase logs for specific policy errors
- Ensure user is authenticated when required

**Images not loading**
- Verify storage bucket exists and is public
- Check image URLs in database
- Verify `next.config.js` remote patterns include Supabase

### Authentication Issues

**Users can't sign up**
- Check email confirmation settings in Supabase
- Verify redirect URLs are configured
- Check Supabase logs for errors

**Session not persisting**
- Verify cookies are being set (check browser dev tools)
- Check middleware is running correctly
- Ensure `@supabase/ssr` version is compatible

---

## Monitoring & Maintenance

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
   - Monitor performance
   - Track errors
   - View real-time logs

2. **Supabase Dashboard**
   - Monitor database usage
   - View auth logs
   - Check storage usage

3. **Sentry** (optional)
   - Error tracking
   - Performance monitoring

### Regular Maintenance

- Monitor Supabase usage (free tier limits)
- Review and update dependencies monthly
- Check for security updates
- Monitor error logs weekly
- Backup database regularly (Supabase provides automatic backups)

---

## Cost Estimates

### Free Tier (Hobby)

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- Free SSL

**Supabase:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**Total: $0/month** (for small-medium traffic)

### Paid Tiers

**Vercel Pro:** $20/month
- More bandwidth
- Team collaboration
- Advanced analytics

**Supabase Pro:** $25/month
- 8GB database
- 100GB file storage
- 100,000 monthly active users

---

## Quick Deploy Commands

### Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables via CLI

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Next Steps After Deployment

1. **Set up custom domain** (if desired)
2. **Configure email templates** in Supabase for better UX
3. **Set up monitoring** (Vercel Analytics, Sentry)
4. **Create admin user** via Supabase dashboard
5. **Test all features** thoroughly
6. **Set up backups** (Supabase provides automatic backups)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

For issues specific to this project, check the `TROUBLESHOOTING.md` file.
