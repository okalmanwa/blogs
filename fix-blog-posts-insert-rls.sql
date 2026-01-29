-- Fix RLS policy for blog_posts INSERT to allow students and admins to create posts
-- Run this in your Supabase SQL Editor
-- 
-- This policy requires:
-- 1. auth.uid() = author_id (user can only create posts as themselves)
-- 2. User must have a profile with role 'student' or 'admin'
--    (Signup automatically creates profiles with role 'student' via trigger)

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Students and admins can insert posts" ON blog_posts;

-- Create the INSERT policy
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

-- Verify the policy was created
SELECT
  policyname,
  cmd,
  CASE
    WHEN cmd = 'SELECT' THEN 'View'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as action,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'blog_posts'
AND cmd = 'INSERT'
ORDER BY policyname;
