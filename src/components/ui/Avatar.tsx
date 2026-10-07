import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/** 사진 없이 이니셜만 쓴다. 브랜드 그린의 옅은 면 위에 그린 글자 */
export function Avatar({ initials, className, ...props }: ComponentProps<'span'> & { initials: string }) {
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent ring-1 ring-line-strong',
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  )
}
