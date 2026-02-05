# Setting Up Admin Users in Supabase

This guide explains how to set a user as admin in your Supabase database.

## Method 1: Using the Script (Recommended)

Use the provided script to set a user as admin:

```bash
node scripts/set-admin.js <email>
```

**Example:**
```bash
node scripts/set-admin.js admin@cornell.edu
```

This script will:
1. Look up the user by email in Supabase Auth
2. Create or update their profile with role `'admin'`
3. Verify the update was successful

**Requirements:**
- Make sure your `.env` file has:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- The user must already exist in Supabase Auth (they need to have registered or been created)

## Method 2: Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this SQL query (replace `your-email@example.com` with the actual email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Verify the update
SELECT 
  p.id,
  p.username,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

## Method 3: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find the user you want to make admin
4. Edit the `role` field and change it to `admin`
5. Save the changes

## How It Works

- When a user logs in, the app checks their `role` in the `profiles` table
- If `role = 'admin'`, they are redirected to `/admin/dashboard`
- If `role = 'student'`, they are redirected to `/student/dashboard`
- If `role = 'viewer'`, they are redirected to `/` (home page)

The role in the database is the **source of truth** - the login code reads from the database and redirects accordingly.

## Troubleshooting

**Issue:** Still redirecting to student dashboard after setting admin role

**Solutions:**
1. Make sure you updated the correct user's profile (check the email matches)
2. Clear your browser cookies and try logging in again
3. Check the browser console for any error messages
4. Verify the role was updated by running the verification query in Method 2

**Issue:** User doesn't exist in profiles table

**Solution:** The user needs to log in at least once, or you can create the profile manually using the script or SQL.
