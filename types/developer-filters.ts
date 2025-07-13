import { LucideIcon, Star, MapPin, Briefcase, Clock, Code2, Building, Award } from 'lucide-react'

export type FilterOption = {
  value: string
  label: string
}

export type Filter = {
  id: string
  icon: LucideIcon
  placeholder: string
  options: FilterOption[]
  apiField?: string // Field name to use in API query
}

export const DEVELOPER_FILTERS: Filter[] = [
  {
    id: 'experience',
    icon: Star,
    placeholder: 'Experience',
    apiField: 'developerFields.experience',
    options: [
      { value: '10', label: '10+ years' },
      { value: '5', label: '5+ years' },
      { value: '3', label: '3+ years' },
      { value: '1', label: '1+ years' }
    ]
  },
  {
    id: 'location',
    icon: MapPin,
    placeholder: 'Location',
    apiField: 'country',
    options: [
      { value: 'United States', label: 'United States' },
      { value: 'Canada', label: 'Canada' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Germany', label: 'Germany' },
      { value: 'France', label: 'France' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Netherlands', label: 'Netherlands' },
      { value: 'Australia', label: 'Australia' },
      { value: 'India', label: 'India' },
      { value: 'Brazil', label: 'Brazil' }
    ]
  },
  {
    id: 'industry',
    icon: Building,
    placeholder: 'Industry',
    apiField: 'developerFields.industries',
    options: [
      { value: 'fintech', label: 'Fintech' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'saas', label: 'SaaS' },
      { value: 'crypto', label: 'Crypto & Web3' },
      { value: 'ai', label: 'AI & Machine Learning' },
      { value: 'mobile', label: 'Mobile Apps' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'education', label: 'Education' },
      { value: 'social', label: 'Social Media' }
    ]
  },
  {
    id: 'skills',
    icon: Code2,
    placeholder: 'Technical Skills',
    apiField: 'developerFields.skills.skill',
    options: [
      { value: 'React', label: 'React' },
      { value: 'Node.js', label: 'Node.js' },
      { value: 'TypeScript', label: 'TypeScript' },
      { value: 'JavaScript', label: 'JavaScript' },
      { value: 'Python', label: 'Python' },
      { value: 'Java', label: 'Java' },
      { value: 'Go', label: 'Go' },
      { value: 'Rust', label: 'Rust' },
      { value: 'Swift', label: 'Swift' },
      { value: 'Kotlin', label: 'Kotlin' },
      { value: 'Vue.js', label: 'Vue.js' },
      { value: 'Angular', label: 'Angular' },
      { value: 'Next.js', label: 'Next.js' },
      { value: 'React Native', label: 'React Native' },
      { value: 'Flutter', label: 'Flutter' },
      { value: 'AWS', label: 'AWS' },
      { value: 'Docker', label: 'Docker' },
      { value: 'Kubernetes', label: 'Kubernetes' }
    ]
  },
  {
    id: 'role',
    icon: Briefcase,
    placeholder: 'Role',
    apiField: 'developerFields.primaryRole',
    options: [
      { value: 'Frontend Developer', label: 'Frontend Developer' },
      { value: 'Backend Developer', label: 'Backend Developer' },
      { value: 'Full Stack Developer', label: 'Full Stack Developer' },
      { value: 'Mobile Developer', label: 'Mobile Developer' },
      { value: 'DevOps Engineer', label: 'DevOps Engineer' },
      { value: 'Data Scientist', label: 'Data Scientist' },
      { value: 'Machine Learning Engineer', label: 'ML Engineer' },
      { value: 'UI/UX Designer', label: 'UI/UX Designer' },
      { value: 'Product Manager', label: 'Product Manager' }
    ]
  },
  {
    id: 'rating',
    icon: Award,
    placeholder: 'Rating',
    apiField: 'rating', // This would need to be calculated
    options: [
      { value: '4', label: '4+ stars' },
      { value: '3', label: '3+ stars' },
      { value: '2', label: '2+ stars' }
    ]
  }
]

export type FilterValues = {
  [K in Filter['id']]?: string
}

export const DEVELOPER_SORT_OPTIONS: FilterOption[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'developerFields.experience_desc', label: 'Most Experienced' },
  { value: 'developerFields.experience_asc', label: 'Least Experienced' },
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'createdAt_asc', label: 'Oldest' }
]