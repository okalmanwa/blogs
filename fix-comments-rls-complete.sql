-- Complete fix for comments RLS policy
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing problematic policy
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- Step 2: Create a simpler, working policy
-- This policy allows any authenticated user to insert comments where they are the author
-- and they have a profile (required by foreign key constraint)
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    -- User must be the author
    AND auth.uid() = author_id
    -- User must have a profile (required by foreign key)
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'comments' AND policyname = 'Authenticated users can insert comments';
