import { TriangleAlert } from 'lucide-react'
import { StatusIcon } from '@/components/data/StatusIcon'
import { Mono, Value } from '@/components/data/Mono'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { STATUS_BG, STATUS_LABEL, STATUS_TEXT, type ServerStatus } from '@/lib/status'
import type { ActivityEvent } from '@/mock/types'

type Props = {
  /** 아직 해소되지 않은 Warning·Error(openIssues). 비어 있으면 아무것도 그리지 않는다 */
  issues: ActivityEvent[]
  /** 지금 켜져 있는 심각도 필터 */
  severity: ServerStatus | null
  onSeverity: (s: ServerStatus | null) => void
  onOpen: (id: string) => void
}

/** 이 건수 이하면 이슈 목록까지 펼치고, 넘으면 머리 한 줄로 접는다 */
const EXPAND_MAX = 3

const sinceText = (at: number) => relativeTime(at).replace(' 전', '째')

/**
 * 표 위의 미해소 이슈 띠. Error가 있으면 머리 줄을 빨강으로 꽉 채우고(솔리드), Warning만 있으면 노랑 틴트로 한 단계 낮춘다.
 * 색의 세기가 심각도를 같이 말하고, 평소에는 이슈가 없어 띠 자체가 없다. 머리의 Error·Warning 개수는
 * 심각도 필터를 켜는 버튼이고, 펼친 목록의 행을 누르면 그 이벤트의 상세 드로어가 열린다.
 */
export function OpenIssues({ issues, severity, onSeverity, onOpen }: Props) {
  if (issues.length === 0) return null
  const counts = { error: issues.filter((e) => e.severity === 'error').length, warning: 0 }
  counts.warning = issues.length - counts.error
  const solid = counts.error > 0

  return (
    <section
      aria-label="조치가 필요한 이슈"
      className={cn(
        'overflow-hidden rounded-md border',
        solid ? 'border-st-error bg-surface' : 'border-st-warning/40 border-l-[4px] border-l-st-warning bg-st-warning/8',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-[12px] gap-y-[6px] px-[14px]',
          // 솔리드 빨강 위 글자: 라이트는 흰색, 다크는 밝은 빨강이라 어두운 글자
          solid ? 'bg-st-error py-[10px] text-white dark:text-[#1a0b0b]' : 'py-[12px]',
        )}
      >
        {solid ? <TriangleAlert className="size-[16px] shrink-0" aria-hidden /> : <StatusIcon status="warning" />}
        <h2 className={cn('text-sm font-semibold', !solid && STATUS_TEXT.warning)}>조치가 필요한 이슈 {issues.length}건</h2>
        <ul className="flex items-center gap-[6px]">
          {(['error', 'warning'] as const).map((s) =>
            counts[s] === 0 ? null : (
              <li key={s}>
                <button
                  type="button"
                  aria-pressed={severity === s}
                  onClick={() => onSeverity(severity === s ? null : s)}
                  className={cn(
                    'flex h-[28px] cursor-pointer items-center gap-[6px] rounded-sm border px-[10px] text-xs transition-colors',
                    solid
                      ? cn(
                          'border-white/30 hover:bg-white/25 dark:border-black/30 dark:hover:bg-black/25',
                          severity === s ? 'bg-white/30 dark:bg-black/30' : 'bg-white/15 dark:bg-black/15',
                        )
                      : cn(
                          'bg-raised hover:border-line-strong hover:bg-accent-subtle',
                          severity === s ? 'border-line-strong bg-accent-subtle text-ink' : 'border-line text-ink-soft',
                        ),
                  )}
                >
                  <span className={cn('size-[8px] rounded-[2px]', solid ? 'bg-current' : STATUS_BG[s])} />
                  {STATUS_LABEL[s]}
                  <Value value={counts[s]} className="font-semibold" />
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
      {issues.length <= EXPAND_MAX && (
        <ul className={cn('divide-y', solid ? 'bg-surface' : 'divide-line/70 border-t border-line/70 bg-surface/60')}>
          {issues.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onOpen(e.id)}
                className="flex w-full cursor-pointer items-center gap-[10px] px-[14px] py-[10px] text-left transition-colors hover:bg-accent-subtle focus-visible:bg-accent-subtle focus-visible:outline-none"
              >
                <StatusIcon status={e.severity} />
                <span className="min-w-0 flex-1 text-[13px] leading-5">{e.text}</span>
                <Mono className="hidden shrink-0 text-xs font-medium sm:inline">{e.hostname}</Mono>
                <span className="num shrink-0 text-xs text-ink-mute">{sinceText(e.at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
