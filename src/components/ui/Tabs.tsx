import { Tabs as T } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const Tabs = T.Root
export const TabsContent = ({ className, ...props }: ComponentProps<typeof T.Content>) => (
  <T.Content className={cn('outline-none', className)} {...props} />
)

/** Vercel 식 밑줄 탭. 목록 아래 1px 선 위에 활성 탭의 2px 막대가 겹쳐진다 */
export function TabsList({ className, ...props }: ComponentProps<typeof T.List>) {
  return <T.List className={cn('flex items-center gap-1 border-b', className)} {...props} />
}

type TriggerProps = ComponentProps<typeof T.Trigger> & { count?: ReactNode }

export function TabsTrigger({ className, children, count, ...props }: TriggerProps) {
  return (
    <T.Trigger
      className={cn(
        'relative -mb-px flex h-10 cursor-pointer items-center gap-2 px-3 text-sm text-ink-mute transition-colors',
        'hover:text-ink data-[state=active]:font-medium data-[state=active]:text-ink',
        "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 after:content-['']",
        'data-[state=active]:after:scale-x-100',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="num rounded-sm bg-sunken px-1.5 text-[11px] leading-[18px] text-ink-soft">{count}</span>
      )}
    </T.Trigger>
  )
}
