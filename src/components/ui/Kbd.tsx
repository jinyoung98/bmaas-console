import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'num inline-flex h-5 min-w-5 items-center justify-center rounded-sm border bg-bg px-1 text-[11px] text-ink-mute',
        className,
      )}
      {...props}
    />
  )
}
