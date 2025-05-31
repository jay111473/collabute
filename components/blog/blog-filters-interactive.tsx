'use client'

import React, { useState, useMemo } from 'react'
import { Blog, Category, Tag } from '@/types/blog'
import { getCategoryName } from '@/lib/utils/blog-utils'

interface BlogFiltersInteractiveProps {
  initialBlogs: Blog[]
  categories: Category[]
  tags: Tag[]
  onFilteredBlogsChange: (blogs: Blog[]) => void
}

export const BlogFiltersInteractive: React.FC<BlogFiltersInteractiveProps> = ({
  initialBlogs,
  categories,
  tags,
  onFilteredBlogsChange
}) => {
  const [activeFilter, setActiveFilter] = useState('All posts')

  // Create filter options from categories and tags
  const filterOptions = useMemo(() => {
    const options = ['All posts']
    
    // Add categories
    categories.forEach(category => {
      options.push(category.name)
    })
    
    // Add tags with # prefix
    tags.forEach(tag => {
      options.push(`#${tag.name}`)
    })
    
    return options
  }, [categories, tags])

  // Filter blogs based on active filter
  const filteredBlogs = useMemo(() => {
    let filtered: Blog[] = []

    if (activeFilter === 'All posts') {
      filtered = initialBlogs.filter(blog => blog.publishedAt)
    } else if (activeFilter.startsWith('#')) {
      // Tag filter
      const tagName = activeFilter.slice(1)
      filtered = initialBlogs.filter(blog => {
        if (!blog.tags || !blog.publishedAt) return false
        
        return blog.tags.some(tag => {
          const tagObj = typeof tag === 'object' ? tag : tags.find(t => t.id === tag)
          return tagObj?.name.toLowerCase() === tagName.toLowerCase()
        })
      })
    } else {
      // Category filter
      filtered = initialBlogs.filter(blog => {
        if (!blog.publishedAt) return false
        
        const categoryObj = typeof blog.category === 'object' 
          ? blog.category 
          : categories.find(c => c.id === blog.category)
        
        return categoryObj?.name.toLowerCase() === activeFilter.toLowerCase()
      })
    }

    return filtered
  }, [initialBlogs, categories, tags, activeFilter])

  // Notify parent component when filtered blogs change
  React.useEffect(() => {
    onFilteredBlogsChange(filteredBlogs)
  }, [filteredBlogs, onFilteredBlogsChange])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  return (
    <div className="relative mb-16">
      {/* Background container */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Filter by topic</h2>
          <p className="text-sm text-zinc-400">Discover content that interests you most</p>
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((filter) => {
            const isTag = filter.startsWith('#')
            const isActive = activeFilter === filter
            
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                  isActive
                    ? 'bg-darkPrimary/20 text-darkPrimary border border-darkPrimary/30 shadow-lg shadow-darkPrimary/10'
                    : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800/70 hover:text-white hover:border-zinc-600/50'
                }`}
              >
                {/* Active state glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-darkPrimary/10 via-darkPrimary/5 to-darkPrimary/10 rounded-xl blur-sm" />
                )}
                
                {/* Text content */}
                <span className="relative z-10">
                  {filter}
                  {isTag && (
                    <span className="ml-1 text-xs opacity-70">tag</span>
                  )}
                </span>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-zinc-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-2 h-2 bg-darkPrimary rounded-full"></div>
              <span>
                Showing {activeFilter === 'All posts' ? 'all' : activeFilter} articles
              </span>
            </div>
            <div className="text-zinc-500">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-darkPrimary/15 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  )
} 