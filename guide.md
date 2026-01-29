# Student Blog Platform - Technical Specification

## Project Overview
A clean, modern blog platform for students with three user roles, project-based organization, and an integrated gallery system.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## User Roles & Permissions

### 1. Students (Bloggers)
- Create, edit, and delete their own blog posts
- Upload images to posts (stored in gallery)
- View all public blogs and gallery
- Edit/delete their own uploaded photos
- Filter blogs by project

### 2. Administrators
- All student permissions PLUS:
- Create/update/delete projects
- Mark projects as open/closed
- Delete any blog post or comment
- Retag images between projects
- Manage all user content

### 3. Viewers (Public Users)
- View all published blogs
- Browse gallery with project filtering
- Filter blogs by project name
- No authentication required for viewing

## Database Schema (Supabase)

### Tables:

#### 1. `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('student', 'admin', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `projects`
```sql
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
```

#### 3. `blog_posts`
```sql
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
```

#### 4. `gallery_images`
```sql
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
```

#### 5. `comments`
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## File Structure

```
student-blog-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── page.tsx          # Homepage
│   │   ├── blogs/
│   │   │   ├── page.tsx      # Blog listing
│   │   │   └── [slug]/
│   │   ├── gallery/
│   │   │   ├── page.tsx      # Gallery
│   │   │   └── [project]/
│   │   └── projects/
│   │       └── page.tsx      # Project listing
│   ├── (dashboard)/
│   │   ├── student/
│   │   │   ├── dashboard/
│   │   │   ├── posts/
│   │   │   │   ├── new/
│   │   │   │   ├── edit/[id]/
│   │   │   │   └── my-posts/
│   │   │   └── gallery/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── users/
│   │   │   └── moderation/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── upload/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── blog/                 # Blog components
│   ├── gallery/              # Gallery components
│   ├── forms/                # Form components
│   └── admin/                # Admin components
├── lib/
│   ├── supabase/             # Supabase client
│   ├── utils/                # Utility functions
│   └── validations/          # Form validations
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript types
├── public/                   # Static assets
└── .env.local
```

## Core Features Implementation

### 1. Authentication Flow
- Supabase Auth with email/password
- Role-based route protection
- Session management with middleware

### 2. Blog System
- Rich text editor (TipTap or similar)
- Image upload integration
- Draft/Published states
- Project tagging
- SEO-friendly URLs

### 3. Gallery System
- Grid layout with lazy loading
- Project filtering
- Image tagging to projects
- Student: Edit/delete own images
- Admin: Full management

### 4. Project Management
- Admin creates yearly projects
- Open/Closed status
- Auto-tagging of related content
- Archive functionality

### 5. Search & Filter
- Client-side filtering by project
- Full-text search for blogs
- Gallery filtering by tags/projects

## Security Considerations

### Row Level Security (RLS) Policies:

```sql
-- Example RLS for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Students can manage their own posts
CREATE POLICY "Students can manage own posts" ON blog_posts
  FOR ALL USING (
    auth.uid() = author_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('student', 'admin')
    )
  );

-- Admins can manage all posts
CREATE POLICY "Admins can manage all posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

## API Routes

### 1. Upload API
```typescript
// app/api/upload/route.ts
POST /api/upload
- Handles image uploads to Supabase Storage
- Returns public URL
- Associates with user and project
```

### 2. Blog API
```typescript
// app/api/blogs/route.ts
GET /api/blogs?project=:projectId
POST /api/blogs
PATCH /api/blogs/:id
DELETE /api/blogs/:id
```

### 3. Gallery API
```typescript
// app/api/gallery/route.ts
GET /api/gallery?project=:projectId&page=:page
POST /api/gallery
DELETE /api/gallery/:id
```

## UI/UX Design Guidelines

### 1. Color Scheme
- Primary: Indigo (#4F46E5)
- Secondary: Emerald (#10B981)
- Background: Gray-50 (#F9FAFB)
- Text: Gray-900 (#111827)

### 2. Typography
- Headings: Inter (sans-serif)
- Body: System default
- Code: Mono font

### 3. Layout
- Clean, minimal design
- Card-based content display
- Responsive grid system
- Consistent spacing (8px base)

### 4. Components
- Reusable button variants
- Modal dialogs for confirmations
- Toast notifications
- Loading skeletons
- Empty states

## Performance Optimizations

### 1. Image Optimization
- Next.js Image component
- Automatic format conversion
- Lazy loading
- Responsive sizing

### 2. Data Fetching
- Server Components for static content
- Client-side for interactive features
- React Query for mutations
- SWR for real-time updates

### 3. Caching Strategy
- ISR for blog pages
- CDN for images
- Browser caching for static assets

## Deployment Checklist

### 1. Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

### 2. Supabase Setup
1. Create new Supabase project
2. Run SQL schema migrations
3. Enable Storage buckets
4. Configure RLS policies
5. Set up email auth

### 3. Vercel Deployment
1. Connect GitHub repository
2. Add environment variables
3. Configure build settings
4. Set up custom domain

## Testing Strategy

### 1. Unit Tests
- Component testing with Jest
- Utility function tests
- API route tests

### 2. Integration Tests
- Authentication flows
- CRUD operations
- Role-based access

### 3. E2E Tests
- User journeys
- Cross-browser testing
- Mobile responsiveness

## Maintenance & Monitoring

### 1. Analytics
- Vercel Analytics for performance
- Custom event tracking
- Error monitoring

### 2. Backup Strategy
- Daily database backups
- Image storage redundancy
- Export functionality for content

### 3. Scaling Considerations
- Pagination for large datasets
- CDN for global access
- Database indexing strategy

## No-Code/VibeCode Setup Guide

I'll create a separate `SETUP_GUIDE.md` file with step-by-step instructions for both no-code setup (using templates and GUI tools) and VibeCode setup (for developers who want to customize).

---

**Next Steps:**
1. Set up Supabase project with the provided schema
2. Initialize Next.js project with TypeScript
3. Implement authentication layer
4. Build core components (header, layout, cards)
5. Develop student dashboard
6. Create admin interface
7. Implement gallery system
8. Add filtering and search
9. Test all user flows
10. Deploy and monitor

