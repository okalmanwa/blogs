# Cornell SC Johnson College of Business - Student Blog Platform

A modern blog platform for students with project-based organization, integrated gallery, and role-based access control.

## Features

- **Three User Roles**: Students, Administrators, and Viewers
- **Blog System**: Create, edit, and publish blog posts with project tagging
- **Gallery System**: Upload and manage images organized by projects
- **Project Management**: Admin-controlled yearly projects with open/closed status
- **Comments**: Threaded comments on blog posts
- **Cornell Branding**: Official Cornell SC Johnson College of Business colors and logo

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     username VARCHAR(50) UNIQUE NOT NULL,
     full_name VARCHAR(100),
     avatar_url TEXT,
     role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('student', 'admin', 'viewer')),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create projects table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(100) UNIQUE NOT NULL,
     description TEXT,
     year INTEGER NOT NULL,
     status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
     admin_id UUID REFERENCES profiles(id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create blog_posts table
   CREATE TABLE blog_posts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title VARCHAR(200) NOT NULL,
     content TEXT NOT NULL,
     excerpt TEXT,
     author_id UUID REFERENCES profiles(id) NOT NULL,
     project_id UUID REFERENCES projects(id),
     status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
     slug VARCHAR(300) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     published_at TIMESTAMP
   );

   -- Create gallery_images table
   CREATE TABLE gallery_images (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     url TEXT NOT NULL,
     title VARCHAR(200),
     description TEXT,
     author_id UUID REFERENCES profiles(id) NOT NULL,
     project_id UUID REFERENCES projects(id) NOT NULL,
     blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create comments table
   CREATE TABLE comments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     content TEXT NOT NULL,
     author_id UUID REFERENCES profiles(id) NOT NULL,
     blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
     parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

   -- ============================================
   -- PROFILES TABLE POLICIES
   -- ============================================

   -- Allow users to read all profiles
   CREATE POLICY "Anyone can view profiles" ON profiles
     FOR SELECT USING (true);

   -- Allow users to insert their own profile (during registration)
   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Allow admins to update any profile
   CREATE POLICY "Admins can update any profile" ON profiles
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role = 'admin'
       )
     );

   -- ============================================
   -- PROJECTS TABLE POLICIES
   -- ============================================

   -- Anyone can view projects
   CREATE POLICY "Anyone can view projects" ON projects
     FOR SELECT USING (true);

   -- Allow inserts when admin_id is NULL (for hardcoded users) OR when user is authenticated admin
   CREATE POLICY "Allow project creation" ON projects
     FOR INSERT
     WITH CHECK (
       admin_id IS NULL 
       OR (
         auth.uid() IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM profiles
           WHERE id = auth.uid()
           AND role = 'admin'
         )
       )
     );

   -- Allow updates/deletes for authenticated users
   CREATE POLICY "Allow project updates" ON projects
     FOR UPDATE
     USING (auth.uid() IS NOT NULL);

   CREATE POLICY "Allow project deletes" ON projects
     FOR DELETE
     USING (auth.uid() IS NOT NULL);

   -- ============================================
   -- BLOG_POSTS TABLE POLICIES
   -- ============================================

   -- Public can view published posts
   CREATE POLICY "Public can view published posts" ON blog_posts
     FOR SELECT USING (status = 'published');

   -- Authenticated users can view their own posts (including drafts)
   CREATE POLICY "Users can view own posts" ON blog_posts
     FOR SELECT USING (
       auth.uid() = author_id OR status = 'published'
     );

   -- Students and admins can insert posts
   CREATE POLICY "Students and admins can insert posts" ON blog_posts
     FOR INSERT WITH CHECK (
       auth.uid() = author_id
       AND EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role IN ('student', 'admin')
       )
     );

   -- Students can update their own posts
   CREATE POLICY "Students can update own posts" ON blog_posts
     FOR UPDATE USING (
       auth.uid() = author_id
       AND EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role IN ('student', 'admin')
       )
     );

   -- Admins can update any post
   CREATE POLICY "Admins can update any post" ON blog_posts
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role = 'admin'
       )
     );

   -- Students can delete their own posts
   CREATE POLICY "Students can delete own posts" ON blog_posts
     FOR DELETE USING (
       auth.uid() = author_id
       AND EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role IN ('student', 'admin')
       )
     );

   -- Admins can delete any post
   CREATE POLICY "Admins can delete any post" ON blog_posts
     FOR DELETE USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role = 'admin'
       )
     );

   -- ============================================
   -- GALLERY_IMAGES TABLE POLICIES
   -- ============================================

   -- Anyone can view gallery images
   CREATE POLICY "Anyone can view gallery images" ON gallery_images
     FOR SELECT USING (true);

   -- Students and admins can insert images
   CREATE POLICY "Students and admins can insert images" ON gallery_images
     FOR INSERT WITH CHECK (
       auth.uid() = author_id
       AND EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role IN ('student', 'admin')
       )
     );

   -- Users can update/delete their own images
   CREATE POLICY "Users can manage own images" ON gallery_images
     FOR ALL USING (
       auth.uid() = author_id
       AND EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role IN ('student', 'admin')
       )
     );

   -- Admins can update/delete any image
   CREATE POLICY "Admins can manage any image" ON gallery_images
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role = 'admin'
       )
     );

   -- ============================================
   -- COMMENTS TABLE POLICIES
   -- ============================================

   -- Anyone can view comments
   CREATE POLICY "Anyone can view comments" ON comments
     FOR SELECT USING (true);

   -- Authenticated users can insert comments
   CREATE POLICY "Authenticated users can insert comments" ON comments
     FOR INSERT WITH CHECK (
       auth.uid() = author_id AND auth.role() = 'authenticated'
     );

   -- Users can update/delete their own comments
   CREATE POLICY "Users can manage own comments" ON comments
     FOR ALL USING (auth.uid() = author_id);

   -- Admins can delete any comment
   CREATE POLICY "Admins can delete any comment" ON comments
     FOR DELETE USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid()
         AND role = 'admin'
       )
     );
   ```

5. **Set up Supabase Storage**
   - Go to Storage in your Supabase dashboard
   - Create a bucket named `images`
   - Set it to public
   - Configure policies for uploads

6. **Set Up Hardcoded Users**
   - Run the setup script to create test users:
     ```bash
     npm run setup-users
     ```
   - This creates three users with hardcoded passwords:
     - **Admin**: `admin@cornell.edu` / `admin123` → Routes to `/admin/dashboard`
     - **Student**: `student@cornell.edu` / `student123` → Routes to `/student/dashboard`
     - **Viewer**: `viewer@cornell.edu` / `viewer123` → Routes to homepage (public access)
   - Note: The login page will automatically create these users if they don't exist when you try to log in

7. **Download Cornell Logos**
   - Visit https://business.cornell.edu/brand/visuals/
   - Download the SC Johnson College of Business logos (PNG format)
   - Place them in `/public/logos/`:
     - `cornell-logo-red.png`
     - `cornell-logo-black.png`
     - `cornell-logo-white.png`
   - Update the logo paths in `components/ui/Header.tsx` and `components/ui/Footer.tsx`

8. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Blog/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (public)/        # Public-facing pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/              # Reusable UI components
│   ├── blog/             # Blog-specific components
│   ├── gallery/          # Gallery components
│   ├── forms/            # Form components
│   └── admin/            # Admin components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Utility functions
│   └── validations/      # Form validations
├── types/                # TypeScript types
└── public/               # Static assets
```

## User Roles

### Students
- Create, edit, and delete their own blog posts
- Upload images to gallery
- View all public content
- Manage their own content

### Administrators
- All student permissions
- Create/update/delete projects
- Manage all user content
- Content moderation

### Viewers (Public)
- View published blogs
- Browse gallery
- Filter by projects
- No authentication required

## Brand Colors

The platform uses Cornell's official brand colors:
- **Cornell Red**: `#B31B1B`
- **Dark Gray**: `#222222`
- **Light Gray**: `#F7F7F7`

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions.

**Quick Start (Vercel):**
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

The platform is optimized for Vercel deployment with Next.js.

## License

This project is for Cornell SC Johnson College of Business use.

## Support

For issues or questions, please contact the development team.
