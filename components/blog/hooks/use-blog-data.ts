'use client';

import { useState, useMemo } from 'react';
import { BlogWithDetails, Category, Tag } from '@/types/convex';

interface UseBlogDataProps {
  initialBlogs: BlogWithDetails[];
  initialCategories: Category[];
  initialTags: Tag[];
}

interface UseBlogDataReturn {
  blogs: BlogWithDetails[];
  categories: Category[];
  tags: Tag[];
  featuredBlogs: BlogWithDetails[];
  filteredBlogs: BlogWithDetails[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const useBlogData = ({ 
  initialBlogs, 
  initialCategories, 
  initialTags 
}: UseBlogDataProps): UseBlogDataReturn => {
  const [activeFilter, setActiveFilter] = useState('All posts');

  // Get featured blogs (first 5 published blogs)
  const featuredBlogs = useMemo(() => {
    return initialBlogs
      .filter(blog => blog.status === 'published' && blog.publishedAt)
      .sort((a, b) => {
        const timeA = a.publishedAt || a._creationTime;
        const timeB = b.publishedAt || b._creationTime;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [initialBlogs]);

  // Filter blogs based on active filter
  const filteredBlogs = useMemo(() => {
    if (activeFilter === 'All posts') {
      return initialBlogs.filter(blog => blog.status === 'published' && blog.publishedAt);
    }

    // If filter starts with #, it's a tag filter
    if (activeFilter.startsWith('#')) {
      const tagName = activeFilter.slice(1);
      return initialBlogs.filter(blog => {
        if (!blog.tags || blog.status !== 'published' || !blog.publishedAt) return false;
        
        return blog.tags.some(tag => {
          // Handle both populated tags and tag IDs
          if (tag && typeof tag === 'object' && 'name' in tag) {
            return (tag as Tag).name.toLowerCase() === tagName.toLowerCase();
          }
          // If it's just an ID, find it in initialTags
          const tagObj = initialTags.find(t => t._id === tag);
          return tagObj?.name.toLowerCase() === tagName.toLowerCase();
        });
      });
    }

    // Otherwise, it's a category filter
    return initialBlogs.filter(blog => {
      if (blog.status !== 'published' || !blog.publishedAt) return false;
      
      // Handle both populated category and category ID
      const categoryName = blog.category && typeof blog.category === 'object' && 'name' in blog.category
        ? (blog.category as Category).name
        : initialCategories.find(c => c._id === blog.category)?.name;
      
      return categoryName?.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [initialBlogs, initialCategories, initialTags, activeFilter]);

  return {
    blogs: initialBlogs,
    categories: initialCategories,
    tags: initialTags,
    featuredBlogs,
    filteredBlogs,
    activeFilter,
    setActiveFilter,
  };
}; 