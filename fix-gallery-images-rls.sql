-- Fix RLS policies for gallery_images to allow image uploads
-- Run this in your Supabase SQL Editor

-- Drop existing insert policy
DROP POLICY IF EXISTS "Students and admins can insert images" ON gallery_images;

-- Create a policy that allows authenticated users to insert images
-- This policy checks that auth.uid() matches author_id and the user has the right role
CREATE POLICY "Students and admins can insert images" ON gallery_images
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('student', 'admin')
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
WHERE tablename = 'gallery_images'
ORDER BY policyname;
