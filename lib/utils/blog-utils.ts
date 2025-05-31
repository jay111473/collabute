import { Blog, Category, Tag } from '@/types/blog';
import { Media } from '@/types/dashboard';

export const formatBlogDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getMediaUrl = (media: number | Media | null | undefined): string => {
  if (!media) return '/icons/user-avatar.png'; // Default fallback
  
  if (typeof media === 'object' && media.url) {
    return media.url;
  }
  
  // If it's just an ID, we might need to construct the URL
  // This depends on your media storage setup
  return '/icons/user-avatar.png'; // Fallback
};

export const getCategoryName = (category: number | Category): string => {
  if (typeof category === 'object') {
    return category.name;
  }
  return 'Uncategorized';
};

export const getCategoryColor = (category: number | Category): string => {
  if (typeof category === 'object' && category.color) {
    return category.color;
  }
  return '#6B7280'; // Default gray color
};

export const getTagName = (tag: number | Tag): string => {
  if (typeof tag === 'object') {
    return tag.name;
  }
  return 'Tag';
};

export const getTagColor = (tag: number | Tag): string => {
  if (typeof tag === 'object' && tag.color) {
    return tag.color;
  }
  return '#10B981'; // Default green color
};

export const getBlogTags = (blog: Blog): Tag[] => {
  if (!blog.tags) return [];
  
  return blog.tags
    .map(tag => typeof tag === 'object' ? tag : null)
    .filter((tag): tag is Tag => tag !== null);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateBlogSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const extractTextFromRichText = (richtext: Blog['richtext']): string => {
  if (!richtext?.root?.children) return '';
  
  // This is a simplified extraction - you might need to adjust based on your rich text structure
  const extractText = (children: any[]): string => {
    return children
      .map(child => {
        if (child.text) return child.text;
        if (child.children) return extractText(child.children);
        return '';
      })
      .join(' ');
  };
  
  return extractText(richtext.root.children);
};

export const getAuthorInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}; 