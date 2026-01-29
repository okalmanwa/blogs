-- Row Level Security Policies for Student Blog Platform
-- Run this SQL in your Supabase SQL Editor after creating the tables

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Allow users to read all profiles (for displaying author names, etc.)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT
  USING (true);

-- Allow users to insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
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
  FOR SELECT
  USING (true);

-- Only admins can insert projects
CREATE POLICY "Admins can insert projects" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can update projects
CREATE POLICY "Admins can update projects" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- BLOG_POSTS TABLE POLICIES
-- ============================================

-- Public can view published posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can view their own posts (including drafts)
CREATE POLICY "Users can view own posts" ON blog_posts
  FOR SELECT
  USING (
    auth.uid() = author_id
    OR status = 'published'
  );

-- Students and admins can insert posts
CREATE POLICY "Students and admins can insert posts" ON blog_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Students can update their own posts
CREATE POLICY "Students can update own posts" ON blog_posts
  FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Admins can update any post
CREATE POLICY "Admins can update any post" ON blog_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Students can delete their own posts
CREATE POLICY "Students can delete own posts" ON blog_posts
  FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Admins can delete any post
CREATE POLICY "Admins can delete any post" ON blog_posts
  FOR DELETE
  USING (
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
  FOR SELECT
  USING (true);

-- Students and admins can insert images
CREATE POLICY "Students and admins can insert images" ON gallery_images
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Users can update their own images
CREATE POLICY "Users can update own images" ON gallery_images
  FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Admins can update any image
CREATE POLICY "Admins can update any image" ON gallery_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images" ON gallery_images
  FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
    )
  );

-- Admins can delete any image
CREATE POLICY "Admins can delete any image" ON gallery_images
  FOR DELETE
  USING (
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
  FOR SELECT
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND auth.role() = 'authenticated'
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (auth.uid() = author_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
