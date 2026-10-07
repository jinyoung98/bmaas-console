import { ToggleGroup } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Option<T extends string> = { value: T; label?: ReactNode; icon?: ReactNode; ariaLabel?: string }

type Props<T extends string> = {
  value: T
  onValueChange: (v: T) => void
  options: Option<T>[]
  className?: string
}

/** 기간(1h/24h/7d), 뷰(Table/Grid) 전환처럼 항상 하나만 선택되는 작은 토글 */
export function SegmentedControl<T extends string>({ value, onValueChange, options, className }: Props<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix는 선택된 항목을 다시 누르면 빈 값을 주는데, 여기서는 항상 하나가 선택돼 있어야 한다
      onValueChange={(v) => v && onValueChange(v as T)}
      className={cn('inline-flex h-8 items-center gap-0.5 rounded-md border bg-sunken p-0.5', className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          aria-label={o.ariaLabel}
          className={cn(
            'flex h-6 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 text-xs font-medium text-ink-mute transition-colors',
            'hover:text-ink data-[state=on]:bg-raised data-[state=on]:text-ink data-[state=on]:shadow-[0_0_0_1px_var(--line)]',
            '[&_svg]:size-3.5',
          )}
        >
          {o.icon}
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
