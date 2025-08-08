# Admin Panel Setup Instructions

## Overview
This admin panel provides secure access to manage your platform data with role-based authentication.

## Quick Setup (Recommended)

### 1. Seed Admin Role & Assign to User

Run the seeding script to create the admin role and assign it to a user:

```bash
# Create admin role with all permissions
bun run seed:admin

# Create admin role and assign to specific user
bun run seed:admin admin@example.com
```

> **Note**: The user email must already exist in your database (registered through normal signup).

### 2. Alternative Setup Methods

#### Option A: Manual Setup Page
1. **Register a regular user account** through your normal registration process
2. **Visit the setup page**: Navigate to `/admin/setup`
3. **Enter the email** of the user you want to make admin
4. **Enter their full name** 
5. **Click "Create Admin Account"**

#### Option B: Direct Database Seeding
If you need more control, use the Convex functions directly:

```javascript
// In Convex dashboard or your code
await ctx.runMutation("seed:seedDatabase", {
  adminEmail: "admin@example.com"
});
```

### 2. Access Admin Panel

1. Navigate to `/admin/login`
2. Sign in with the admin user's credentials
3. You'll be redirected to the admin dashboard

## Features

### Authentication & Security
- ✅ Role-based access control
- ✅ Admin-only routes protection
- ✅ Secure login with existing auth system
- ✅ Automatic redirect for unauthorized users
- ✅ Session management with logout

### Admin Panel Sections
- **Dashboard**: Overview with statistics
- **Users**: Manage user accounts and roles
- **Projects**: View and manage projects
- **Issues**: Track and manage issues
- **Messages**: Monitor platform communications
- **Roles**: Manage user roles and permissions

## Admin Role Management

### Creating Additional Admins
Once logged in as an admin, you can:
1. Go to the Users section
2. Find the user you want to promote
3. Edit their role to assign admin privileges

### Admin Permissions
Admin users have access to:
- View all platform data
- Manage users and their roles
- Access system statistics
- Monitor communications
- Manage projects and issues

## Security Notes

- Only users with admin role can access `/admin/*` routes
- Login attempts are protected by your existing auth system
- Admin status is verified on every page load
- Automatic logout redirects to login page

## Troubleshooting

### Cannot Access Admin Panel
1. Ensure you've completed the initial setup at `/admin/setup`
2. Verify the user account exists and is registered
3. Try logging out and back in
4. Check that the user has been assigned the admin role

### Setup Page Not Working
1. Ensure the email belongs to an existing registered user
2. Make sure no admin user already exists
3. Check browser console for any errors

### General Issues
1. Clear browser cache and cookies
2. Ensure you're using the correct login credentials
3. Verify your internet connection
4. Check if there are any server errors in logs