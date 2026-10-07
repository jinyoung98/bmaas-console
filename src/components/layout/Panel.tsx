import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** 화면을 나누는 기본 단위. 카드가 아니라 "제목줄이 있는 선 박스"다 */
export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-lg border bg-surface', className)} {...props} />
}

type HeaderProps = { title: string; description?: string; actions?: ReactNode; className?: string }

export function PanelHeader({ title, description, actions, className }: HeaderProps) {
  return (
    <header className={cn('flex min-h-12 items-center justify-between gap-4 border-b px-5 py-2.5', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-ink-mute">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}

export function PanelBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}
