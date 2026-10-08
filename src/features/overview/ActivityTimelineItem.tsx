import { Mono } from '@/components/data/Mono'
import { StatusIcon } from '@/components/data/StatusIcon'
import { relativeTime } from '@/lib/format'
import { STATUS_LABEL, STATUS_TEXT } from '@/lib/status'
import type { ActivityEvent } from '@/mock/types'

const sep = <span className="mx-[6px] opacity-60">·</span>

type Props = {
  event: ActivityEvent
  /** 마지막 항목은 아래로 이어지는 레일이 없다 */
  last: boolean
  /** 호스트명 줄. 한 서버의 활동만 보여주는 곳에서는 끈다 */
  showHost?: boolean
  region?: string
}

/**
 * 타임라인 한 줄: 틴트 링 아이콘 + (호스트명) / 설명 / 상태 · 리전 · 시간. 세로 레일은 항목 사이를 잇는다.
 * 루트 폰트가 14px라 rem 기반 spacing으로는 아이콘 중심과 레일이 어긋난다. 그래서 치수는 px로 고정한다.
 */
export function ActivityTimelineItem({ event: e, last, showHost = true, region }: Props) {
  return (
    <li
      className={
        'relative flex gap-[12px] pb-[18px] last:pb-0 ' +
        (!last ? "before:absolute before:bottom-[4px] before:left-[9.5px] before:top-[24px] before:w-px before:bg-line before:content-['']" : '')
      }
    >
      <StatusIcon status={e.severity} />
      <div className="min-w-0">
        {showHost && <Mono className="block text-sm font-medium">{e.hostname}</Mono>}
        <p className="text-sm text-ink-soft">{e.text}</p>
        <p className="num mt-[2px] text-xs text-ink-mute">
          <span className={`text-[11px] font-medium ${STATUS_TEXT[e.severity]}`}>{STATUS_LABEL[e.severity]}</span>
          {region && (
            <>
              {sep}
              {region}
            </>
          )}
          {sep}
          {relativeTime(e.at)}
        </p>
      </div>
    </li>
  )
}
