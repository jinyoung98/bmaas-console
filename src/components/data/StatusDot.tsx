import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_BADGE, type ServerStatus } from '@/lib/status'

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

/** 24px 틴트 배지. 루트 폰트가 14px라 rem 대신 px로 치수를 고정한다 */
export function StatusBadge({ status, className }: DotProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[24px] items-center gap-[6px] rounded-sm px-[8px] text-xs font-medium',
        STATUS_BADGE[status],
        className,
      )}
    >
      <span className={cn('size-[6px] rounded-full', STATUS_BG[status])} />
      {STATUS_LABEL[status]}
    </span>
  )
}
