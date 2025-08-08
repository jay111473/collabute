'use client'

import React from 'react'
import { Category, Tag } from '@/types/convex'

interface BlogFiltersProps {
  categories: Category[]
  tags: Tag[]
  activeFilter: string
  setActiveFilter: (filter: string) => void
  filteredBlogsCount: number
  isLoading: boolean
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  categories,
  tags,
  activeFilter,
  setActiveFilter,
  filteredBlogsCount,
  isLoading
}) => {
  // Create filter options from categories and tags
  const filterOptions = React.useMemo(() => {
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

  if (isLoading) {
    return (
      <div className="relative mb-16">
        {/* Background container */}
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Filter by topic</h2>
            <p className="text-sm text-zinc-400">Discover content that interests you most</p>
          </div>

          {/* Loading skeleton */}
          <div className="flex flex-wrap gap-3">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="h-10 bg-zinc-700 rounded-xl animate-pulse"
                style={{ width: `${Math.random() * 60 + 60}px` }}
              />
            ))}
          </div>

          {/* Stats skeleton */}
          <div className="mt-6 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-zinc-700 rounded w-32 animate-pulse" />
              <div className="h-4 bg-zinc-700 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
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
                onClick={() => setActiveFilter(filter)}
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
              {filteredBlogsCount} article{filteredBlogsCount !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-darkPrimary/15 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  )
} 