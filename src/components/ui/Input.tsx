import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<ComponentProps<'input'>, 'size'> & {
  /** 왼쪽 아이콘 */
  icon?: ReactNode
  /** 오른쪽 끝에 붙는 보조 요소(단축키 등) */
  trailing?: ReactNode
  wrapperClassName?: string
}

export function Input({ icon, trailing, className, wrapperClassName, ...props }: Props) {
  return (
    <div
      className={cn(
        'group flex h-8 items-center gap-2 rounded-md border bg-raised px-2.5 text-sm transition-colors',
        'hover:border-line-strong focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        wrapperClassName,
      )}
    >
      {icon && <span className="text-ink-mute [&_svg]:size-4">{icon}</span>}
      <input
        className={cn(
          'min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-mute',
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  )
}
