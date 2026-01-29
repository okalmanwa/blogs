-- Create missing profile for com34@cornell.edu
-- Run this in your Supabase SQL Editor

-- First, find the user ID
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'com34@cornell.edu';
  
  -- If user exists, create their profile
  IF user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, full_name, role)
    VALUES (
      user_id,
      split_part('com34@cornell.edu', '@', 1), -- username from email
      NULL, -- full_name
      'student' -- role
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'student'; -- Update role if profile already exists
    
    RAISE NOTICE 'Profile created/updated for user: %', user_id;
  ELSE
    RAISE NOTICE 'User com34@cornell.edu not found in auth.users';
  END IF;
END $$;

-- Verify the profile was created
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.role,
  au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'com34@cornell.edu';
