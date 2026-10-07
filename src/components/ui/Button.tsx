import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const button = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium',
    'transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'border-accent bg-accent text-accent-ink hover:bg-accent/90',
        secondary: 'border-line-strong bg-raised text-ink hover:bg-accent-subtle',
        ghost: 'border-transparent text-ink-soft hover:bg-accent-subtle hover:text-ink',
        danger: 'border-st-error/40 bg-raised text-st-error hover:bg-st-error/10',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-9 px-4 text-base',
        icon: 'size-8',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type Props = ComponentProps<'button'> & VariantProps<typeof button> & { asChild?: boolean }

export function Button({ className, variant, size, asChild, type = 'button', ...props }: Props) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp type={asChild ? undefined : type} className={cn(button({ variant, size }), className)} {...props} />
}
