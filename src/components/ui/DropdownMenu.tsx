import { Check } from 'lucide-react'
import { DropdownMenu as D } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const DropdownMenu = D.Root
export const DropdownMenuTrigger = D.Trigger
export const DropdownMenuRadioGroup = D.RadioGroup

const item =
  'relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-sm outline-none ' +
  'data-[highlighted]:bg-accent-subtle data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ' +
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-mute'

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[200px] origin-[var(--radix-dropdown-menu-content-transform-origin)] rounded-lg border bg-raised p-1',
          'shadow-[0_8px_30px_rgb(0_0_0/0.14)] data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          className,
        )}
        {...props}
      />
    </D.Portal>
  )
}

export const DropdownMenuItem = ({ className, ...props }: ComponentProps<typeof D.Item>) => (
  <D.Item className={cn(item, className)} {...props} />
)

export const DropdownMenuLabel = ({ className, ...props }: ComponentProps<typeof D.Label>) => (
  <D.Label className={cn('px-2 py-1.5 text-xs text-ink-mute', className)} {...props} />
)

export const DropdownMenuSeparator = ({ className, ...props }: ComponentProps<typeof D.Separator>) => (
  <D.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
)

export function DropdownMenuCheckboxItem({ className, children, ...props }: ComponentProps<typeof D.CheckboxItem>) {
  return (
    <D.CheckboxItem className={cn(item, 'pl-8', className)} {...props}>
      <D.ItemIndicator className="absolute left-2 grid place-items-center">
        <Check className="!text-accent" />
      </D.ItemIndicator>
      {children}
    </D.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof D.RadioItem>) {
  return (
    <D.RadioItem className={cn(item, 'pl-8', className)} {...props}>
      <D.ItemIndicator className="absolute left-2 grid place-items-center">
        <Check className="!text-accent" />
      </D.ItemIndicator>
      {children}
    </D.RadioItem>
  )
}
