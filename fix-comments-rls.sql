-- Fix comments RLS policy
-- Remove the auth.role() check which doesn't work in Supabase RLS
-- Just check that auth.uid() matches author_id and user has a profile

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- Create the corrected policy
-- User must be authenticated AND have a profile (since author_id references profiles)
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );
