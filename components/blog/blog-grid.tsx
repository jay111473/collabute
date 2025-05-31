import React from "react";
import { BlogCard } from "./blog-card";

const blogPosts = [
  {
    id: 1,
    category: "ENGINEERING",
    date: "May 28, 2025",
    title: "How we organize our monorepo to ship fast",
    author: {
      name: "Greg Foster",
      avatar: "/icons/user-avatar.png",
    },
  },
  {
    id: 2,
    category: "LAUNCHES",
    date: "April 29, 2025",
    title: "Graphite brings stacking to Tower",
    author: {
      name: "Kenneth DuMez",
      avatar: "/icons/user-avatar.png",
    },
  },
  {
    id: 3,
    category: "ENGINEERING",
    date: "April 17, 2025",
    title: "Code review tooling: Should you build or buy?",
    author: {
      name: "Sara Verdi",
      avatar: "/icons/user-avatar.png",
    },
  },
  {
    id: 4,
    category: "ENGINEERING",
    categorySecondary: "COMPANY",
    date: "March 27, 2025",
    title: "Making AI code review available to everyone",
    author: {
      name: "Greg Foster",
      avatar: "/icons/user-avatar.png",
    },
  },
  {
    id: 5,
    category: "CHANGELOG",
    date: "March 19, 2025",
    title: "Introducing: The new Graphite merge workflow",
    author: {
      name: "Kenneth DuMez",
      avatar: "/icons/user-avatar.png",
    },
  },
  {
    id: 6,
    category: "LAUNCHES",
    categorySecondary: "COMPANY",
    date: "March 18, 2025",
    title: "Graphite raises $52M and launches AI code review",
    author: {
      name: "Sara Verdi",
      avatar: "/icons/user-avatar.png",
    },
  },
];

export const BlogGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
      {blogPosts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};
