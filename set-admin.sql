-- Set admin@cornell.edu as admin
-- Run this in Supabase SQL Editor

UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@cornell.edu'
);

-- Verify the update
SELECT 
  p.id,
  p.username,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@cornell.edu';
