import { describe, expect, it } from 'vitest'
import { cn } from '@/utils/cn'

describe('cn utility', () => {
  it('should merge tailwind classes correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  it('should resolve tailwind conflicts', () => {
    // twMerge should keep the last one
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isError = false
    const result = cn('base', isActive && 'active', isError && 'error')
    expect(result).toBe('base active')
  })
})
