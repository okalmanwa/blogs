-- Verify and fix RLS policies for projects table
-- Run this in your Supabase SQL Editor

-- First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'projects';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
DROP POLICY IF EXISTS "Allow project creation" ON projects;
DROP POLICY IF EXISTS "Allow project updates" ON projects;
DROP POLICY IF EXISTS "Allow project deletes" ON projects;

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to SELECT (read)
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT
  USING (true);

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

-- Allow updates for authenticated users OR projects created by hardcoded users
-- (admin check happens in app layer - only admins can access edit functionality)
CREATE POLICY "Allow project updates" ON projects
  FOR UPDATE
  USING (
    -- Allow if user is authenticated (real Supabase users)
    auth.uid() IS NOT NULL
    -- OR allow if project was created by hardcoded user (admin_id IS NULL)
    -- This allows hardcoded admin users to update projects
    OR admin_id IS NULL
  );

-- Allow deletes for authenticated users OR projects created by hardcoded users
-- (admin check happens in app layer - only admins can access delete functionality)
CREATE POLICY "Allow project deletes" ON projects
  FOR DELETE
  USING (
    -- Allow if user is authenticated (real Supabase users)
    auth.uid() IS NOT NULL
    -- OR allow if project was created by hardcoded user (admin_id IS NULL)
    -- This allows hardcoded admin users to delete projects
    OR admin_id IS NULL
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'projects';

-- Test query (should work even without auth)
-- This should return all projects if RLS is working correctly
SELECT COUNT(*) as project_count FROM projects;
