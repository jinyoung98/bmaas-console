import { Popover as P } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Popover = P.Root
export const PopoverTrigger = P.Trigger

export function PopoverContent({ className, sideOffset = 8, align = 'end', ...props }: ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 origin-[var(--radix-popover-content-transform-origin)] rounded-lg border bg-raised outline-none',
          'shadow-[0_8px_30px_rgb(0_0_0/0.14)] data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          className,
        )}
        {...props}
      />
    </P.Portal>
  )
}
