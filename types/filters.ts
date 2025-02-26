import { LucideIcon, Star, MapPin, Briefcase, Clock, Code2 } from 'lucide-react'

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

export const FILTERS: Filter[] = [
  {
    id: 'experience',
    icon: Star,
    placeholder: 'Experience',
    apiField: 'leadFields.experience',
    options: [
      { value: '5', label: '5+ years' },
      { value: '3', label: '3+ years' },
      { value: '1', label: '1+ years' }
    ]
  },
  {
    id: 'availability',
    icon: Clock,
    placeholder: 'Availability',
    apiField: 'leadFields.availability',
    options: [
      { value: 'true', label: 'Available' },
      { value: 'false', label: 'Not Available' }
    ]
  },
  {
    id: 'stack',
    icon: Code2,
    placeholder: 'Stack',
    apiField: 'leadFields.stack.name',
    options: [
      { value: 'react', label: 'React' },
      { value: 'node', label: 'Node.js' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
      { value: 'ruby', label: 'Ruby' }
    ]
  },
  {
    id: 'role',
    icon: Briefcase,
    placeholder: 'Role',
    apiField: 'developerFields.primaryRole',
    options: [
      { value: 'Frontend Developer', label: 'Frontend' },
      { value: 'Backend Developer', label: 'Backend' },
      { value: 'Full Stack Developer', label: 'Full Stack' },
      { value: 'Mobile Developer', label: 'Mobile' },
      { value: 'DevOps Engineer', label: 'DevOps' },
      { value: 'Data Scientist', label: 'Data Science' },
      { value: 'UI/UX Designer', label: 'UI/UX' }
    ]
  }
]

export type FilterValues = {
  [K in Filter['id']]?: string
}

export const SORT_OPTIONS: FilterOption[] = [
  { value: 'leadFields.experience_desc', label: 'Most Experienced' },
  { value: 'leadFields.experience_asc', label: 'Least Experienced' },
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'createdAt_asc', label: 'Oldest' }
] 