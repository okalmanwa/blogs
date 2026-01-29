# Admin User Guide

Welcome to the Student Blog Platform Admin Guide! This guide will help you navigate and manage the platform effectively.

**Platform URL:** https://famous-lamington-f4a918.netlify.app/

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Content Moderation](#content-moderation)
4. [Project Management](#project-management)
5. [User Management](#user-management)
6. [Best Practices](#best-practices)

---

## Getting Started

### Logging In

1. Navigate to the platform URL: https://famous-lamington-f4a918.netlify.app/
2. Click on **"Login"** in the top navigation bar
3. Enter your admin credentials:
   - **Email:** `admin@cornell.edu`
   - **Password:** `admin123`
4. Click **"Sign In"**

Once logged in, you'll see the **Admin Dashboard** link in the navigation menu.

---

## Admin Dashboard Overview

The Admin Dashboard is your central hub for managing the platform. You can access it by clicking **"Admin Dashboard"** in the navigation menu.

### Navigation Menu

As an admin, you have access to the following sections:

- **Admin Dashboard** - Main dashboard for project management
- **Content Moderation** - Review and manage all posts and comments
- **Projects** - Create and manage academic projects
- **Users** - View all registered users

---

## Content Moderation

The **Content Moderation** page (`/admin/moderation`) is where you review, edit, and manage all student posts and comments.

### Accessing Content Moderation

1. Click **"Admin Dashboard"** in the navigation menu
2. Click **"Content Moderation"** (or navigate to `/admin/moderation`)

### Managing Posts

#### Viewing Posts

The moderation page displays all posts in a table format with the following information:
- **Title** - Click to view the full post
- **Author** - Username of the student who created the post
- **Date** - When the post was created
- **Status** - Published (green dot) or Draft (amber dot)
- **Actions** - Edit or Delete buttons

#### Filtering and Sorting

- **Filter by Project:** Use the filter sidebar (mobile) or filter dropdown to show posts from specific projects
- **Sort:** Sort posts by newest (default) or oldest

#### Editing a Post

1. Click the **"Edit"** button next to any post
2. You'll be taken to the post editor where you can:
   - Modify the title
   - Edit the content (supports HTML formatting)
   - Change the associated project
   - Toggle between Draft and Published status
   - Add or modify images
3. Click **"Save Draft"** or **"Publish"** when finished
4. You'll be redirected back to view the updated post

#### Deleting a Post

1. Click the **"Delete"** button next to the post you want to remove
2. A confirmation dialog will appear asking: "Are you sure you want to delete this post?"
3. Click **"Delete"** to confirm or **"Cancel"** to abort
4. The post will be permanently removed from the platform

**⚠️ Warning:** Deleted posts cannot be recovered. Make sure you want to permanently remove the content before confirming.

### Managing Comments

#### Viewing Comments

Below the posts section, you'll see all comments with:
- **Comment Content** - The actual comment text
- **Author** - Username of the commenter
- **Date** - When the comment was posted
- **Associated Post** - Link to the blog post the comment belongs to
- **Actions** - Edit or Delete buttons

#### Editing Comments

1. Click the **"Edit"** button next to any comment
2. Modify the comment text in the inline editor
3. Click **"Save"** to update or **"Cancel"** to discard changes

#### Deleting Comments

1. Click the **"Delete"** button next to the comment
2. Confirm the deletion in the dialog
3. The comment will be permanently removed

---

## Project Management

Projects organize student submissions by academic year or initiative. Students must select a project when creating posts.

### Accessing Project Management

1. Click **"Admin Dashboard"** in the navigation menu
2. Click **"Projects"** (or navigate to `/admin/projects`)

### Creating a New Project

1. Click the **"Create New Project"** button
2. Fill in the project details:
   - **Name** - e.g., "Fall 2024 Projects" or "Capstone Projects 2024"
   - **Description** - Optional description of the project
   - **Year** - Academic year (e.g., 2024)
   - **Status** - Choose "Open" (students can select) or "Closed" (archived)
3. Click **"Create Project"**

### Editing a Project

1. Find the project you want to edit in the projects list
2. Click the **"Edit"** button (pencil icon)
3. Modify any of the project details
4. Click **"Save Changes"**

### Deleting a Project

1. Click the **"Delete"** button (trash icon) next to the project
2. Confirm the deletion
3. **Note:** Projects with associated posts should typically be closed rather than deleted

### Project Status

- **Open** - Active projects that students can select when creating posts
- **Closed** - Archived projects that are no longer accepting new submissions

---

## User Management

The **Users** page (`/admin/users`) displays all registered users on the platform.

### Accessing User Management

1. Click **"Admin Dashboard"** in the navigation menu
2. Click **"Users"** (or navigate to `/admin/users`)

### Viewing Users

The users page shows:
- **Username** - The user's display name
- **Full Name** - Real name (if provided)
- **Role** - Admin, Student, or Viewer
- **Join Date** - When the user registered

### User Roles

- **Admin** - Full platform access (you!)
- **Student** - Can create posts, upload images, and manage their own content
- **Viewer** - Read-only access to published content

**Note:** User role management is currently view-only. To change a user's role, you'll need database access.

---

## Best Practices

### Content Moderation

1. **Review Before Publishing:** Check draft posts for quality, appropriateness, and adherence to guidelines before publishing
2. **Edit, Don't Delete:** When possible, edit posts to fix issues rather than deleting them
3. **Communicate Changes:** If you make significant edits, consider noting them in a comment or contacting the student
4. **Monitor Comments:** Regularly review comments for inappropriate content or spam

### Project Management

1. **Create Projects Early:** Set up projects for each academic term before students start posting
2. **Use Descriptive Names:** Name projects clearly (e.g., "Fall 2024 - Introduction to Business")
3. **Close Old Projects:** Archive completed projects by setting status to "Closed"
4. **Don't Delete Active Projects:** Close projects instead of deleting them to preserve post associations

### General Administration

1. **Regular Reviews:** Check the moderation page regularly for new content
2. **Consistent Standards:** Apply content guidelines consistently across all posts
3. **Backup Important Content:** Before deleting, ensure you have backups if needed
4. **Stay Updated:** Keep track of platform updates and new features

---

## Quick Reference

### Keyboard Shortcuts

- **Refresh Page:** Click the refresh button (circular arrow icon) in the top right of admin pages
- **Navigate:** Use the navigation menu to switch between admin sections

### Common Tasks

| Task | Location | Steps |
|------|----------|-------|
| Edit a post | Content Moderation | Click "Edit" → Modify → Save |
| Delete a post | Content Moderation | Click "Delete" → Confirm |
| Create project | Projects or Dashboard | Click "Create New Project" → Fill form → Create |
| View all users | Users | Navigate to Users page |
| Filter posts by project | Content Moderation | Use filter sidebar/dropdown |

### Status Indicators

- 🟢 **Green Dot** - Published post (visible to public)
- 🟡 **Amber Dot** - Draft post (only visible to author and admins)

---

## Troubleshooting

### Can't See Admin Menu

- Ensure you're logged in with admin credentials
- Check that your user role is set to "admin"
- Try logging out and logging back in

### Posts Not Appearing

- Check if posts are filtered by project
- Verify the post status (draft vs. published)
- Use the refresh button to reload data

### Can't Edit a Post

- Ensure you're on the Content Moderation page
- Check that you're logged in as an admin
- Try refreshing the page

---

## Support

If you encounter issues or have questions:

1. Check this guide first
2. Review the platform's main documentation
3. Contact the development team for technical support

---

## Security Notes

- **Keep Credentials Secure:** Never share your admin password
- **Log Out:** Always log out when finished, especially on shared computers
- **Review Regularly:** Regularly review content and user activity
- **Backup Important Data:** Before making major changes, ensure important content is backed up

---

**Last Updated:** January 2025

**Platform Version:** Student Blog Platform v1.0
