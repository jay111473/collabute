import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const sendProjectManagerInvitation = mutation({
  args: {
    email: v.string(),
    projectName: v.optional(v.string()),
    inviterName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    
    // Create invitation record
    const invitationId = await ctx.db.insert("invitations", {
      email: args.email,
      token: invitationToken,
      type: "PROJECT_MANAGER",
      projectName: args.projectName,
      inviterName: args.inviterName,
      status: "PENDING",
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Generate invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?token=${invitationToken}&type=PROJECT_MANAGER`;

    // Send email using Resend
    try {
      // TODO: Implement Resend email sending
      // For now, just return success
      await sendInvitationEmail({
        to: args.email,
        inviterName: args.inviterName || "Collabute Team",
        projectName: args.projectName || "your project",
        invitationUrl,
      });

      return {
        success: true,
        invitationId,
        invitationUrl,
      };
    } catch (error) {
      // Delete the invitation if email sending fails
      await ctx.db.delete(invitationId);
      throw new Error("Failed to send invitation email");
    }
  },
});

// Helper function for sending emails (to be implemented with Resend)
async function sendInvitationEmail({
  to,
  inviterName,
  projectName,
  invitationUrl,
}: {
  to: string;
  inviterName: string;
  projectName: string;
  invitationUrl: string;
}) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; color: white; padding: 40px 20px; text-align: center;">
        <h1 style="color: #7b61ff; margin: 0;">You're Invited to Join Collabute</h1>
        <p style="color: #888; margin: 10px 0;">As a Technical Product Manager</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f9f9f9;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hi there!
        </p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          <strong>${inviterName}</strong> has invited you to be the Technical Product Manager for <strong>${projectName}</strong> on Collabute.
        </p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
          As a Technical Product Manager, you'll coordinate between technical teams and business goals, manage project timelines, and ensure successful delivery.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${invitationUrl}" 
             style="background: #7b61ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 40px;">
          This invitation will expire in 7 days. If you have any questions, please contact us at team@collabute.com
        </p>
      </div>
    </div>
  `;

  // TODO: Implement actual Resend integration
  console.log(`Sending invitation email to ${to}:`, emailContent);
  
  // For now, simulate successful email sending
  return Promise.resolve();
}

// Query to get invitation by token
export const getInvitationByToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("Invitation has expired");
    }

    if (invitation.status !== "PENDING") {
      throw new Error("Invitation has already been used");
    }

    return invitation;
  },
});

// Mark invitation as used
export const markInvitationAsUsed = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    await ctx.db.patch(invitation._id, {
      status: "ACCEPTED",
      usedAt: Date.now(),
    });

    return invitation;
  },
});