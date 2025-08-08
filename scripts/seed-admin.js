#!/usr/bin/env node

/**
 * Admin Role Seeding Script
 * 
 * This script seeds the database with admin role and assigns it to a user.
 * 
 * Usage:
 *   bun run seed:admin
 *   bun run seed:admin admin@example.com
 */

// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { ConvexHttpClient } = require("convex/browser");

// Configuration
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const ADMIN_EMAIL = process.argv[2]; // Optional: pass admin email as argument

console.log("🔧 Environment Check:");
console.log(`   NEXT_PUBLIC_CONVEX_URL: ${process.env.NEXT_PUBLIC_CONVEX_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   CONVEX_URL: ${process.env.CONVEX_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   Final CONVEX_URL: ${CONVEX_URL || '❌ Not found'}`);

if (!CONVEX_URL) {
  console.error("\n❌ Error: CONVEX_URL environment variable is required");
  console.error("Make sure NEXT_PUBLIC_CONVEX_URL or CONVEX_URL is set in your .env.local file");
  console.error("Expected format: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedDatabase() {
  console.log("\n🌱 Starting database seeding...");
  console.log(`📡 Using Convex URL: ${CONVEX_URL}`);
  
  try {
    // Run the seeding mutation
    const result = await client.mutation("seed:seedDatabase", {
      adminEmail: ADMIN_EMAIL,
    });

    if (result.success) {
      console.log("✅ Database seeded successfully!");
      console.log("\n📊 Results:");
      
      // Admin role
      if (result.results.adminRole) {
        console.log(`   Admin role: ${result.results.adminRole.action} (ID: ${result.results.adminRole.roleId})`);
      }
      
      // Default roles
      if (result.results.defaultRoles) {
        console.log(`   Default roles: ${result.results.defaultRoles.roles.length} roles processed`);
        result.results.defaultRoles.roles.forEach(role => {
          console.log(`   - ${role.name}: ${role.action}`);
        });
      }
      
      // Admin assignment
      if (result.results.adminAssignment) {
        console.log(`   Admin assigned to: ${result.results.adminAssignment.userEmail} (${result.results.adminAssignment.userName})`);
      } else if (ADMIN_EMAIL) {
        console.log(`   ⚠️  Could not assign admin role to ${ADMIN_EMAIL} - user may not exist`);
      }
      
      console.log("\n🎉 Seeding completed successfully!");
      
      if (!ADMIN_EMAIL) {
        console.log("\n💡 Next steps:");
        console.log("   1. Run this script with an email to assign admin role:");
        console.log("      bun run seed:admin admin@example.com");
        console.log("   2. Or use the /admin/setup page to create your first admin");
      } else {
        console.log("\n💡 Next steps:");
        console.log("   1. Visit /admin/login to access the admin panel");
        console.log(`   2. Sign in with the credentials for ${ADMIN_EMAIL}`);
      }
      
    } else {
      console.error("❌ Seeding failed:", result.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   - Check that your Convex deployment is running");
    console.error("   - Verify the CONVEX_URL is correct");
    console.error("   - Ensure the user email exists in the database");
    console.error("   - Try running: convex dev");
    process.exit(1);
  }
}

async function checkSeedingStatus() {
  try {
    console.log("🔍 Checking current seeding status...");
    
    const status = await client.mutation("seed:getSeedingStatus", {});
    
    console.log("\n📊 Current Status:");
    console.log(`   Admin role exists: ${status.adminRoleExists ? '✅' : '❌'}`);
    console.log(`   Total roles: ${status.totalRoles}`);
    console.log(`   Admin users: ${status.adminUsersCount}`);
    
    if (status.roles.length > 0) {
      console.log("\n   Roles in database:");
      status.roles.forEach(role => {
        console.log(`   - ${role.name} (${role.displayName}): ${role.permissionCount} permissions`);
      });
    }
    
    if (status.adminUsers.length > 0) {
      console.log("\n   Admin users:");
      status.adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    }
    
    console.log();
    
  } catch (error) {
    console.error("❌ Error checking status:", error.message);
  }
}

// Main execution
async function main() {
  console.log("🚀 Admin Role Seeding Script");
  console.log("================================");
  
  // Check current status first
  await checkSeedingStatus();
  
  // Ask for confirmation if no admin email provided
  if (!ADMIN_EMAIL) {
    console.log("⚠️  No admin email provided. This will:");
    console.log("   - Create/update the admin role with all permissions");
    console.log("   - Create/update default user roles");
    console.log("   - NOT assign admin role to any user");
    console.log("\n   To assign admin role, run: bun run seed:admin admin@example.com");
    console.log();
  }
  
  // Run seeding
  await seedDatabase();
}

main().catch(console.error);