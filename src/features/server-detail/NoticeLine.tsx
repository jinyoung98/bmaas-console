import { StatusIcon } from '@/components/data/StatusIcon'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { STATUS_LABEL, STATUS_TEXT, type NoticeStatus } from '@/lib/status'

/** 상태색 30% 테두리 + 7% 배경. Tailwind가 찾을 수 있게 전체 이름을 적는다 */
const BOX: Record<NoticeStatus, string> = {
  warning: 'border-st-warning/30 bg-st-warning/7',
  error: 'border-st-error/30 bg-st-error/7',
  maintenance: 'border-st-maintenance/30 bg-st-maintenance/7',
}

type Props = { status: NoticeStatus; text: string; at?: number; className?: string }

/** 헤더 아래 한 줄 알림: 틴트 링 아이콘 + 상태명 + 사유 + 시간. 타임라인과 같은 아이콘이라 같은 상태가 같은 모양으로 읽힌다 */
export function NoticeLine({ status, text, at, className }: Props) {
  return (
    <div role="status" className={cn('flex items-center gap-[10px] rounded-md border px-[14px] py-[10px]', BOX[status], className)}>
      <StatusIcon status={status} />
      <span className={cn('shrink-0 text-xs font-semibold', STATUS_TEXT[status])}>{STATUS_LABEL[status]}</span>
      <span className="min-w-0 flex-1 text-[13px] leading-5">{text}</span>
      {at !== undefined && <span className="num hidden shrink-0 text-xs text-ink-mute sm:inline">{relativeTime(at)}</span>}
    </div>
  )
}
