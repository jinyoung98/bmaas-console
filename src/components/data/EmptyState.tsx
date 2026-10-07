import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

/** 데이터가 없을 때 빈 화면 대신 "무엇이 여기에 들어오는지"를 알려준다 */
export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center', className)}>
      <span className="grid size-10 place-items-center rounded-md border bg-surface text-ink-mute">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
