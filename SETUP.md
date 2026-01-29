# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Create `.env` file with your credentials (see `.env.example`)

3. **Run Database Migrations**
   - Open Supabase SQL Editor
   - Copy and paste the SQL from `README.md` section "Set up Supabase Database"
   - Execute the SQL

4. **Set Up Storage**
   - In Supabase Dashboard, go to Storage
   - Create a new bucket named `images`
   - Set it to public
   - Add policy:
     ```sql
     CREATE POLICY "Public Access" ON storage.objects
       FOR SELECT USING (bucket_id = 'images');
     
     CREATE POLICY "Authenticated users can upload" ON storage.objects
       FOR INSERT WITH CHECK (
         bucket_id = 'images' 
         AND auth.role() = 'authenticated'
       );
     ```

5. **Download Cornell Logos**
   - Visit https://business.cornell.edu/brand/visuals/
   - Download SC Johnson College of Business logos (PNG format)
   - Save to `/public/logos/`:
     - `cornell-logo-red.png`
     - `cornell-logo-black.png`
     - `cornell-logo-white.png`
   - Note: Currently using text fallback. Update Header/Footer components to use Image component when logos are available.

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Create First Admin User**
   - Register a new account
   - In Supabase SQL Editor, run:
     ```sql
     UPDATE profiles 
     SET role = 'admin' 
     WHERE username = 'your_username';
     ```

## Next Steps

- Customize branding colors in `tailwind.config.ts`
- Add rich text editor (TipTap, Quill, etc.) for blog posts
- Configure email templates in Supabase
- Set up domain and deploy to Vercel
