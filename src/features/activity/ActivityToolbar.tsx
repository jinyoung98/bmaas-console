import { Search } from 'lucide-react'
import { Value } from '@/components/data/Mono'
import { Combobox } from '@/components/ui/Combobox'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER, type ServerStatus } from '@/lib/status'
import type { ActivityRange } from '@/mock/selectors'
import { servers } from '@/mock/servers'

type Props = {
  q: string
  severity: ServerStatus | null
  server: string | null
  range: ActivityRange
  /** 심각도 필터만 뺀 결과 안에서의 심각도별 개수 */
  counts: Record<ServerStatus, number>
  onSearch: (q: string) => void
  onSeverity: (s: ServerStatus | null) => void
  onServer: (hostname: string | null) => void
  onRange: (r: ActivityRange) => void
}

const RANGES = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
] as const

const chip = (on: boolean) =>
  cn(
    'flex h-[32px] cursor-pointer items-center gap-[6px] rounded-sm border bg-raised px-[10px] text-sm transition-colors',
    'hover:border-line-strong hover:bg-accent-subtle',
    on ? 'border-line-strong bg-accent-subtle text-ink' : 'border-line text-ink-soft',
  )

/**
 * 2행 툴바(Servers와 같은 구성). 1행은 왼쪽 검색, 오른쪽에 서버 선택과 기간 묶음이고,
 * 2행은 심각도 칩 5개. 칩은 누르면 필터가 켜지고 꺼진다.
 */
export function ActivityToolbar({ q, severity, server, range, counts, onSearch, onSeverity, onServer, onRange }: Props) {
  return (
    <div className="grid gap-[8px]">
      <div className="flex flex-wrap items-center gap-[8px]">
        <Input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="이벤트, 서버, 행위자 검색"
          aria-label="이벤트, 서버, 행위자 검색"
          icon={<Search />}
          wrapperClassName="h-[32px] min-w-[200px] flex-1 sm:max-w-[320px]"
        />
        <div className="ml-auto flex items-center gap-[8px]">
          <Combobox
            value={server}
            onChange={onServer}
            allLabel="모든 서버"
            searchPlaceholder="서버 검색"
            emptyText="일치하는 서버가 없습니다"
            options={servers.map((s) => ({ value: s.hostname, label: s.hostname }))}
          />
          <SegmentedControl value={range} onValueChange={onRange} options={[...RANGES]} />
        </div>
      </div>

      <ul className="flex flex-wrap gap-[6px]" aria-label="심각도 필터">
        {STATUS_ORDER.map((s) => {
          const on = severity === s
          return (
            <li key={s}>
              <button type="button" aria-pressed={on} onClick={() => onSeverity(on ? null : s)} className={chip(on)}>
                <span className={cn('size-[8px] rounded-[2px]', STATUS_BG[s])} />
                {STATUS_LABEL[s]}
                <Value value={counts[s]} className={cn('text-xs font-semibold', on ? 'text-ink' : 'text-ink-mute')} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
