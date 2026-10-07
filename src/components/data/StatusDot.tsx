import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_SOFT, type ServerStatus } from '@/lib/status'

type DotProps = { status: ServerStatus; className?: string }

/** 8px LED 점. Running은 바깥 링이 천천히 숨쉬어서 "살아 있음"을 표현한다 */
export function StatusDot({ status, className }: DotProps) {
  return (
    <span className={cn('relative inline-flex size-2 shrink-0', className)} aria-hidden>
      {status === 'running' && (
        <span className={cn('absolute inset-0 animate-ping rounded-full opacity-40 [animation-duration:2.4s]', STATUS_BG[status])} />
      )}
      <span className={cn('relative size-2 rounded-full', STATUS_BG[status])} />
    </span>
  )
}

export function StatusBadge({ status, className }: DotProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded-sm border px-1.5 text-xs font-medium',
        STATUS_SOFT[status],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', STATUS_BG[status])} />
      {STATUS_LABEL[status]}
    </span>
  )
}
