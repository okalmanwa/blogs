# Hardcoded Users

This application includes three hardcoded users for testing and development purposes.

## User Credentials

### Admin User
- **Email**: `admin@cornell.edu`
- **Password**: `admin123`
- **Role**: Admin
- **Redirects to**: `/admin/dashboard`
- **Permissions**: Full access to all features including project management, user management, and content moderation

### Student User
- **Email**: `student@cornell.edu`
- **Password**: `student123`
- **Role**: Student
- **Redirects to**: `/student/dashboard`
- **Permissions**: Can create/edit blog posts, upload images, manage own content

### Viewer User
- **Email**: `viewer@cornell.edu`
- **Password**: `viewer123`
- **Role**: Viewer
- **Redirects to**: `/` (homepage)
- **Permissions**: Read-only access to published content

## Setup

To set up these users in your Supabase database, run:

```bash
npm run setup-users
```

This script will:
1. Create the three users in Supabase Auth
2. Create corresponding profiles with the correct roles
3. Set the passwords as specified above

## Auto-Creation

If you try to log in with these credentials and the users don't exist yet, the login page will automatically create them. However, it's recommended to run the setup script first for a cleaner setup.

## Security Note

⚠️ **These are hardcoded credentials for development/testing only.**
- Do NOT use these passwords in production
- Change passwords after initial setup in production environments
- Consider implementing proper authentication flows for production use
