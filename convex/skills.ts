import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return await ctx.db.insert("skills", {
      ...args,
      slug,
      isActive: args.isActive ?? true,
    });
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let skills = await ctx.db.query("skills").collect();

    if (args.category) {
      skills = skills.filter(skill => skill.category === args.category);
    }

    if (args.isActive !== undefined) {
      skills = skills.filter(skill => skill.isActive === args.isActive);
    }

    skills.sort((a, b) => a.name.localeCompare(b.name));

    if (args.limit) {
      skills = skills.slice(0, args.limit);
    }

    return skills;
  },
});

export const getByIds = query({
  args: {
    skillIds: v.array(v.id("skills")),
  },
  handler: async (ctx, args) => {
    const skills = await Promise.all(
      args.skillIds.map(id => ctx.db.get(id))
    );
    return skills.filter(Boolean);
  },
});

export const update = mutation({
  args: {
    skillId: v.id("skills"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { skillId, ...updates } = args;
    
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    await ctx.db.patch(skillId, updates);
    return true;
  },
});

export const remove = mutation({
  args: {
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.skillId);
    return true;
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const skills = await ctx.db.query("skills").collect();
    return skills.length;
  },
});