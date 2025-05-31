'use client'

import React, { useState, useCallback } from 'react'
import { Blog, Category, Tag } from '@/types/blog'
import { BlogFiltersInteractive } from './blog-filters-interactive'
import { BlogList } from './blog-list'

interface BlogClientWrapperProps {
  initialBlogs: Blog[]
  categories: Category[]
  tags: Tag[]
}

export const BlogClientWrapper: React.FC<BlogClientWrapperProps> = ({
  initialBlogs,
  categories,
  tags
}) => {
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>(
    initialBlogs.filter(blog => blog.publishedAt)
  )

  const handleFilteredBlogsChange = useCallback((blogs: Blog[]) => {
    setFilteredBlogs(blogs)
  }, [])

  return (
    <>
      {/* Interactive Filters */}
      <BlogFiltersInteractive
        initialBlogs={initialBlogs}
        categories={categories}
        tags={tags}
        onFilteredBlogsChange={handleFilteredBlogsChange}
      />
      
      {/* All articles section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-darkPrimary to-darkPrimary/50 rounded-full" />
          <h2 className="text-2xl font-bold text-white">All Articles</h2>
        </div>
        <p className="text-zinc-400 text-lg">
          Complete archive of our engineering insights and stories
        </p>
      </div>
      
      {/* Filtered Blog list */}
      <BlogList 
        blogs={filteredBlogs}
        isLoading={false}
      />
    </>
  )
} 