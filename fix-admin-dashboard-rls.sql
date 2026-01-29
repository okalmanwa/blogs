-- Fix RLS policies to allow admin dashboard stats queries
-- Run this in your Supabase SQL Editor

-- ============================================
-- BLOG_POSTS TABLE - Allow admins to count all posts
-- ============================================

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view own posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON blog_posts;

-- Create a comprehensive policy that allows:
-- 1. Anyone to view published posts
-- 2. Users to view their own posts (including drafts)
-- 3. Admins to view ALL posts (for dashboard stats)
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view own posts" ON blog_posts
  FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" ON blog_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- PROJECTS TABLE - Ensure anyone can view (should already exist)
-- ============================================

-- Verify the SELECT policy exists
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;

CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT
  USING (true);

-- ============================================
-- GALLERY_IMAGES TABLE - Ensure anyone can view
-- ============================================

-- Verify the SELECT policy exists
DROP POLICY IF EXISTS "Anyone can view gallery images" ON gallery_images;

CREATE POLICY "Anyone can view gallery images" ON gallery_images
  FOR SELECT
  USING (true);

-- ============================================
-- PROFILES TABLE - Ensure anyone can view (should already exist)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT
  USING (true);

-- ============================================
-- Verify policies
-- ============================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_using
FROM pg_policies 
WHERE tablename IN ('blog_posts', 'projects', 'gallery_images', 'profiles')
ORDER BY tablename, policyname;

-- Test queries (should all return counts)
SELECT 'blog_posts' as table_name, COUNT(*) as count FROM blog_posts
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'gallery_images', COUNT(*) FROM gallery_images;
