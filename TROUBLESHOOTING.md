# Troubleshooting Guide

## Rate Limiting Errors (429)

If you see errors like "rate exceeded" or status code 429, this means Supabase is rate-limiting your requests.

### Solutions:

1. **Wait a few minutes** - Rate limits reset after a short period
2. **Use the setup script** - Instead of auto-creating users on login, run:
   ```bash
   npm run setup-users
   ```
   This creates all hardcoded users at once using the service role key (which has higher rate limits)

3. **Check Supabase Dashboard** - Go to your Supabase project settings to see current rate limits

## Common Issues

### "User not found" errors
- Make sure you've run the setup script: `npm run setup-users`
- Or manually create users in Supabase Auth dashboard

### RLS Policy Errors
- Make sure you've run all the RLS policies from `supabase-rls-policies.sql`
- Check that the "Users can insert own profile" policy exists

### Profile Creation Errors
- Ensure RLS policies are set up correctly
- Check that the user ID matches `auth.uid()` when inserting profiles

## Best Practices

1. **Always run setup script first** before testing login
2. **Use hardcoded credentials** for testing:
   - Admin: `admin@cornell.edu` / `admin123`
   - Student: `student@cornell.edu` / `student123`
   - Viewer: `viewer@cornell.edu` / `viewer123`
3. **Avoid rapid repeated login attempts** to prevent rate limiting
