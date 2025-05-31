'use client';

import { useState, useEffect, useMemo } from 'react';
import { Blog, Category, Tag } from '@/types/blog';
import { blogService } from '@/lib/services/blog-service';

interface UseBlogDataReturn {
  blogs: Blog[];
  categories: Category[];
  tags: Tag[];
  featuredBlogs: Blog[];
  filteredBlogs: Blog[];
  isLoading: boolean;
  error: string | null;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  refreshData: () => Promise<void>;
}

export const useBlogData = (): UseBlogDataReturn => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All posts');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [blogsData, categoriesData, tagsData] = await Promise.all([
        blogService.getBlogs(),
        blogService.getCategories(),
        blogService.getTags(),
      ]);

      setBlogs(blogsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blog data';
      setError(errorMessage);
      console.error('Error fetching blog data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get featured blogs (first 5 published blogs)
  const featuredBlogs = useMemo(() => {
    return blogs
      .filter(blog => blog.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 5);
  }, [blogs]);

  // Filter blogs based on active filter
  const filteredBlogs = useMemo(() => {
    if (activeFilter === 'All posts') {
      return blogs.filter(blog => blog.publishedAt);
    }

    // If filter starts with #, it's a tag filter
    if (activeFilter.startsWith('#')) {
      const tagName = activeFilter.slice(1);
      return blogs.filter(blog => {
        if (!blog.tags || !blog.publishedAt) return false;
        
        return blog.tags.some(tag => {
          const tagObj = typeof tag === 'object' ? tag : tags.find(t => t.id === tag);
          return tagObj?.name.toLowerCase() === tagName.toLowerCase();
        });
      });
    }

    // Otherwise, it's a category filter
    return blogs.filter(blog => {
      if (!blog.publishedAt) return false;
      
      const categoryObj = typeof blog.category === 'object' 
        ? blog.category 
        : categories.find(c => c.id === blog.category);
      
      return categoryObj?.name.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [blogs, categories, tags, activeFilter]);

  const refreshData = async () => {
    await fetchData();
  };

  return {
    blogs,
    categories,
    tags,
    featuredBlogs,
    filteredBlogs,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    refreshData,
  };
}; 