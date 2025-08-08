import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==============================
// TECH STACK QUERIES
// ==============================

export const list = query({
  args: {
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let techStacks;

    if (args.category) {
      techStacks = await ctx.db
        .query("tech_stacks")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else if (args.isActive !== undefined) {
      techStacks = await ctx.db
        .query("tech_stacks")
        .withIndex("by_active", (q) => q.eq("isActive", args.isActive!))
        .collect();
    } else {
      techStacks = await ctx.db.query("tech_stacks").collect();
    }

    // Apply additional filters
    const filteredStacks = techStacks
      .filter((stack) => 
        args.isActive === undefined || stack.isActive === args.isActive
      )
      .slice(0, args.limit || 100);

    return filteredStacks;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tech_stacks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("tech_stacks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const techStacks = await ctx.db.query("tech_stacks").collect();
    const categories = [...new Set(techStacks.map(stack => stack.category).filter(Boolean))];
    return categories.sort();
  },
});

// ==============================
// TECH STACK MUTATIONS
// ==============================

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
    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existingStack = await ctx.db
      .query("tech_stacks")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingStack) {
      throw new Error("Tech stack with this name already exists");
    }

    return await ctx.db.insert("tech_stacks", {
      name: args.name.trim(),
      slug,
      description: args.description?.trim(),
      category: args.category?.trim(),
      color: args.color?.trim(),
      icon: args.icon?.trim(),
      isActive: args.isActive ?? true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tech_stacks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};

    if (args.name !== undefined) {
      updates.name = args.name.trim();
      // Generate new slug if name changed
      updates.slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if new slug conflicts with existing stack
      const existingStack = await ctx.db
        .query("tech_stacks")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug))
        .first();

      if (existingStack && existingStack._id !== args.id) {
        throw new Error("Tech stack with this name already exists");
      }
    }

    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }
    if (args.category !== undefined) {
      updates.category = args.category.trim();
    }
    if (args.color !== undefined) {
      updates.color = args.color.trim();
    }
    if (args.icon !== undefined) {
      updates.icon = args.icon.trim();
    }
    if (args.isActive !== undefined) {
      updates.isActive = args.isActive;
    }

    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(args.id, filteredUpdates);
    }

    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("tech_stacks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

export const toggleActive = mutation({
  args: { id: v.id("tech_stacks") },
  handler: async (ctx, args) => {
    const techStack = await ctx.db.get(args.id);
    if (!techStack) {
      throw new Error("Tech stack not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !techStack.isActive,
    });

    return !techStack.isActive;
  },
});

// ==============================
// ADMIN FUNCTIONS
// ==============================

export const count = query({
  args: {},
  handler: async (ctx) => {
    const techStacks = await ctx.db.query("tech_stacks").collect();
    return techStacks.length;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if tech stacks already exist
    const existingStacks = await ctx.db.query("tech_stacks").collect();
    if (existingStacks.length > 0) {
      return "Tech stacks already seeded";
    }

    // Common tech stacks
    const techStacks = [
      // Frontend
      { name: "React", category: "frontend", color: "#61DAFB", icon: "react" },
      { name: "Vue.js", category: "frontend", color: "#4FC08D", icon: "vue" },
      { name: "Angular", category: "frontend", color: "#DD0031", icon: "angular" },
      { name: "Svelte", category: "frontend", color: "#FF3E00", icon: "svelte" },
      { name: "Next.js", category: "frontend", color: "#000000", icon: "nextjs" },
      { name: "Nuxt.js", category: "frontend", color: "#00DC82", icon: "nuxtjs" },
      
      // Backend
      { name: "Node.js", category: "backend", color: "#339933", icon: "nodejs" },
      { name: "Express.js", category: "backend", color: "#000000", icon: "express" },
      { name: "Fastify", category: "backend", color: "#000000", icon: "fastify" },
      { name: "Python", category: "backend", color: "#3776AB", icon: "python" },
      { name: "Django", category: "backend", color: "#092E20", icon: "django" },
      { name: "Flask", category: "backend", color: "#000000", icon: "flask" },
      { name: "Ruby on Rails", category: "backend", color: "#CC0000", icon: "rails" },
      { name: "PHP", category: "backend", color: "#777BB4", icon: "php" },
      { name: "Laravel", category: "backend", color: "#FF2D20", icon: "laravel" },
      { name: "Go", category: "backend", color: "#00ADD8", icon: "go" },
      { name: "Rust", category: "backend", color: "#000000", icon: "rust" },
      { name: "Java", category: "backend", color: "#ED8B00", icon: "java" },
      { name: "Spring Boot", category: "backend", color: "#6DB33F", icon: "spring" },
      { name: "C#", category: "backend", color: "#239120", icon: "csharp" },
      { name: ".NET", category: "backend", color: "#512BD4", icon: "dotnet" },
      
      // Database
      { name: "PostgreSQL", category: "database", color: "#4169E1", icon: "postgresql" },
      { name: "MySQL", category: "database", color: "#4479A1", icon: "mysql" },
      { name: "MongoDB", category: "database", color: "#47A248", icon: "mongodb" },
      { name: "Redis", category: "database", color: "#DC382D", icon: "redis" },
      { name: "SQLite", category: "database", color: "#003B57", icon: "sqlite" },
      { name: "Supabase", category: "database", color: "#3ECF8E", icon: "supabase" },
      { name: "Firebase", category: "database", color: "#FFCA28", icon: "firebase" },
      
      // DevOps
      { name: "Docker", category: "devops", color: "#2496ED", icon: "docker" },
      { name: "Kubernetes", category: "devops", color: "#326CE5", icon: "kubernetes" },
      { name: "AWS", category: "devops", color: "#FF9900", icon: "aws" },
      { name: "Google Cloud", category: "devops", color: "#4285F4", icon: "gcp" },
      { name: "Azure", category: "devops", color: "#0078D4", icon: "azure" },
      { name: "Vercel", category: "devops", color: "#000000", icon: "vercel" },
      { name: "Netlify", category: "devops", color: "#00C7B7", icon: "netlify" },
      
      // Mobile
      { name: "React Native", category: "mobile", color: "#61DAFB", icon: "react" },
      { name: "Flutter", category: "mobile", color: "#02569B", icon: "flutter" },
      { name: "Swift", category: "mobile", color: "#FA7343", icon: "swift" },
      { name: "Kotlin", category: "mobile", color: "#7F52FF", icon: "kotlin" },
      { name: "Expo", category: "mobile", color: "#000020", icon: "expo" },
      
      // Languages
      { name: "TypeScript", category: "language", color: "#3178C6", icon: "typescript" },
      { name: "JavaScript", category: "language", color: "#F7DF1E", icon: "javascript" },
      
      // CSS/Styling
      { name: "Tailwind CSS", category: "styling", color: "#06B6D4", icon: "tailwindcss" },
      { name: "SASS", category: "styling", color: "#CC6699", icon: "sass" },
      { name: "Styled Components", category: "styling", color: "#DB7093", icon: "styled-components" },
      
      // Tools
      { name: "Git", category: "tools", color: "#F05032", icon: "git" },
      { name: "GitHub", category: "tools", color: "#181717", icon: "github" },
      { name: "GitLab", category: "tools", color: "#FC6D26", icon: "gitlab" },
      { name: "Webpack", category: "tools", color: "#8DD6F9", icon: "webpack" },
      { name: "Vite", category: "tools", color: "#646CFF", icon: "vite" },
    ];

    // Insert all tech stacks
    for (const stack of techStacks) {
      const slug = stack.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await ctx.db.insert("tech_stacks", {
        name: stack.name,
        slug,
        category: stack.category,
        color: stack.color,
        icon: stack.icon,
        isActive: true,
      });
    }

    return "Tech stacks seeded successfully";
  },
});

