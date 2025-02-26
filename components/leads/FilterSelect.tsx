'use client'

import { FC } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, FilterOption } from '@/types/filters'

interface FilterSelectProps {
  filter: Filter | { 
    placeholder: string
    options: FilterOption[]
  }
  value?: string
  onChange: (value: string) => void
  className?: string
}

export const FilterSelect: FC<FilterSelectProps> = ({
  filter,
  value,
  onChange,
  className = ''
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-[140px] bg-black border-grayBorders text-white rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          {'icon' in filter && <filter.icon className="h-4 w-4" />}
          <SelectValue placeholder={filter.placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {filter.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 