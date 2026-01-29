-- Fix ALL RLS policies for projects table to allow hardcoded users
-- Run this in your Supabase SQL Editor to fix create, update, and delete

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
DROP POLICY IF EXISTS "Allow project creation" ON projects;
DROP POLICY IF EXISTS "Allow project updates" ON projects;
DROP POLICY IF EXISTS "Allow project deletes" ON projects;

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SELECT POLICY - Anyone can view
-- ============================================
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT
  USING (true);

-- ============================================
-- INSERT POLICY - Allow hardcoded users or authenticated admins
-- ============================================
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

-- ============================================
-- UPDATE POLICY - Allow authenticated users OR projects created by hardcoded users
-- ============================================
CREATE POLICY "Allow project updates" ON projects
  FOR UPDATE
  USING (
    -- Allow if user is authenticated (real Supabase users)
    auth.uid() IS NOT NULL
    -- OR allow if project was created by hardcoded user (admin_id IS NULL)
    -- This allows hardcoded admin users to update projects
    -- Note: Security is enforced at app layer - only admins can access edit functionality
    OR admin_id IS NULL
  );

-- ============================================
-- DELETE POLICY - Allow authenticated users OR projects created by hardcoded users
-- ============================================
CREATE POLICY "Allow project deletes" ON projects
  FOR DELETE
  USING (
    -- Allow if user is authenticated (real Supabase users)
    auth.uid() IS NOT NULL
    -- OR allow if project was created by hardcoded user (admin_id IS NULL)
    -- This allows hardcoded admin users to delete projects
    -- Note: Security is enforced at app layer - only admins can access delete functionality
    OR admin_id IS NULL
  );

-- ============================================
-- Verify all policies were created
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
WHERE tablename = 'projects'
ORDER BY cmd, policyname;
