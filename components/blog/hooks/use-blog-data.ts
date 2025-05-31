'use client';

import { useState, useMemo } from 'react';
import { Blog, Category, Tag } from '@/types/blog';

interface UseBlogDataProps {
  initialBlogs: Blog[];
  initialCategories: Category[];
  initialTags: Tag[];
}

interface UseBlogDataReturn {
  blogs: Blog[];
  categories: Category[];
  tags: Tag[];
  featuredBlogs: Blog[];
  filteredBlogs: Blog[];
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
      .filter(blog => blog.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 5);
  }, [initialBlogs]);

  // Filter blogs based on active filter
  const filteredBlogs = useMemo(() => {
    if (activeFilter === 'All posts') {
      return initialBlogs.filter(blog => blog.publishedAt);
    }

    // If filter starts with #, it's a tag filter
    if (activeFilter.startsWith('#')) {
      const tagName = activeFilter.slice(1);
      return initialBlogs.filter(blog => {
        if (!blog.tags || !blog.publishedAt) return false;
        
        return blog.tags.some(tag => {
          const tagObj = typeof tag === 'object' ? tag : initialTags.find(t => t.id === tag);
          return tagObj?.name.toLowerCase() === tagName.toLowerCase();
        });
      });
    }

    // Otherwise, it's a category filter
    return initialBlogs.filter(blog => {
      if (!blog.publishedAt) return false;
      
      const categoryObj = typeof blog.category === 'object' 
        ? blog.category 
        : initialCategories.find(c => c.id === blog.category);
      
      return categoryObj?.name.toLowerCase() === activeFilter.toLowerCase();
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