#!/usr/bin/env node

/**
 * Admin Status Checker Script
 *
 * This script checks the current admin setup status.
 *
 * Usage:
 *   bun run check:admin
 */

// Load environment variables from .env files
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { ConvexHttpClient } = require("convex/browser");

// Configuration
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

console.log("🔧 Environment Check:");
console.log(
  `   NEXT_PUBLIC_CONVEX_URL: ${process.env.NEXT_PUBLIC_CONVEX_URL ? "✅ Set" : "❌ Not set"}`
);
console.log(
  `   CONVEX_URL: ${process.env.CONVEX_URL ? "✅ Set" : "❌ Not set"}`
);
console.log(`   Final CONVEX_URL: ${CONVEX_URL || "❌ Not found"}`);

if (!CONVEX_URL) {
  console.error("\n❌ Error: CONVEX_URL environment variable is required");
  console.error(
    "Make sure NEXT_PUBLIC_CONVEX_URL or CONVEX_URL is set in your .env.local file"
  );
  console.error(
    "Expected format: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkAdminStatus() {
  try {
    console.log("\n🔍 Checking admin setup status...");
    console.log(`📡 Using Convex URL: ${CONVEX_URL}`);

    const status = await client.mutation("seed:getSeedingStatus", {});

    console.log("\n📊 Admin Setup Status");
    console.log("====================");

    // Overall status
    if (status.adminRoleExists && status.adminUsersCount > 0) {
      console.log("✅ Admin setup is COMPLETE");
    } else if (status.adminRoleExists && status.adminUsersCount === 0) {
      console.log("⚠️  Admin role exists but NO admin users assigned");
    } else {
      console.log("❌ Admin setup is INCOMPLETE");
    }

    console.log();

    // Detailed breakdown
    console.log("📋 Details:");
    console.log(
      `   Admin role exists: ${status.adminRoleExists ? "✅" : "❌"}`
    );
    console.log(`   Total roles: ${status.totalRoles}`);
    console.log(`   Admin users: ${status.adminUsersCount}`);

    if (status.roles.length > 0) {
      console.log("\n🎭 Roles in database:");
      status.roles.forEach((role) => {
        const isAdmin = role.name === "admin";
        const icon = isAdmin ? "👑" : "👤";
        const statusIcon = role.isActive ? "✅" : "❌";
        console.log(
          `   ${icon} ${role.name} (${role.displayName}): ${role.permissionCount} permissions ${statusIcon}`
        );
      });
    }

    if (status.adminUsers.length > 0) {
      console.log("\n👑 Admin users:");
      status.adminUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.name || "No name set"})`);
      });
    } else if (status.adminRoleExists) {
      console.log("\n⚠️  No admin users found!");
      console.log("   Run: bun run seed:admin admin@example.com");
    }

    // Recommendations
    console.log("\n💡 Recommendations:");
    if (!status.adminRoleExists) {
      console.log("   1. Run: bun run seed:admin admin@example.com");
      console.log("   2. Or visit: /admin/setup");
    } else if (status.adminUsersCount === 0) {
      console.log("   1. Run: bun run seed:admin admin@example.com");
      console.log("   2. Replace 'admin@example.com' with a real user email");
    } else {
      console.log(
        "   ✅ Setup looks good! Visit /admin/login to access the panel"
      );
    }
  } catch (error) {
    console.error("❌ Error checking admin status:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   - Check that your Convex deployment is running");
    console.error("   - Verify the CONVEX_URL is correct");
    console.error("   - Try running: convex dev");
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log("🔐 Admin Status Checker");
  console.log("=======================");
  await checkAdminStatus();
}

main().catch(console.error);
