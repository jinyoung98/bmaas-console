import { ChevronDown, LayoutGrid, List, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Value } from '@/components/data/Mono'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER, type ServerStatus } from '@/lib/status'
import { regionById, regions } from '@/mock/regions'
import type { RegionId } from '@/mock/types'
import type { ServerView } from './useServerQuery'

const ALL = 'all'

type Props = {
  q: string
  status: ServerStatus | null
  region: RegionId | null
  view: ServerView
  /** 검색과 리전이 적용된 결과 안에서의 상태별 개수 */
  counts: Record<ServerStatus, number>
  onSearch: (q: string) => void
  onStatus: (s: ServerStatus | null) => void
  onRegion: (r: RegionId | null) => void
  onView: (v: ServerView) => void
  /** 리전 선택 앞에 붙는 보기 전용 컨트롤(표 보기의 Columns 메뉴) */
  extra?: ReactNode
}

/**
 * 검색 · 상태 칩 · 리전 · 보기 전환을 한 줄에 둔다. 좁으면 줄을 바꾼다.
 * 상태 칩은 Overview Fleet status 칩과 같은 생김새이고, 여기서는 누르면 필터가 켜지고 꺼진다.
 */
export function ServerToolbar({ q, status, region, view, counts, onSearch, onStatus, onRegion, onView, extra }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <Input
        type="search"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="호스트명, IP 검색"
        aria-label="호스트명, IP 검색"
        icon={<Search />}
        wrapperClassName="h-[32px] w-full sm:w-[220px]"
      />

      <ul className="flex flex-wrap gap-[6px]" aria-label="상태 필터">
        {STATUS_ORDER.map((s) => {
          const on = status === s
          return (
            <li key={s}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onStatus(on ? null : s)}
                className={cn(
                  'flex h-[32px] cursor-pointer items-center gap-[6px] rounded-sm border bg-raised px-[10px] text-sm transition-colors',
                  'hover:border-line-strong hover:bg-accent-subtle',
                  on ? 'border-line-strong bg-accent-subtle text-ink' : 'border-line text-ink-soft',
                )}
              >
                <span className={`size-[8px] rounded-[2px] ${STATUS_BG[s]}`} />
                {STATUS_LABEL[s]}
                <Value value={counts[s]} className={cn('text-xs font-semibold', on ? 'text-ink' : 'text-ink-mute')} />
              </button>
            </li>
          )
        })}
      </ul>

      <span className="flex-1" />

      {extra}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-[32px] cursor-pointer items-center gap-[8px] rounded-sm border bg-raised px-[10px] text-sm text-ink-soft transition-colors hover:border-line-strong data-[state=open]:border-line-strong"
          >
            {region ? (
              <>
                {regionById[region].city}
                <span className="num text-xs text-ink-mute">{region}</span>
              </>
            ) : (
              '모든 리전'
            )}
            <ChevronDown className="size-[14px] text-ink-mute" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={region ?? ALL}
            onValueChange={(v) => onRegion(v === ALL ? null : (v as RegionId))}
          >
            <DropdownMenuRadioItem value={ALL}>모든 리전</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {regions.map((r) => (
              <DropdownMenuRadioItem key={r.id} value={r.id}>
                {r.city}
                <span className="num ml-auto text-xs text-ink-mute">{r.id}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <SegmentedControl
        value={view}
        onValueChange={onView}
        options={[
          { value: 'table', label: 'Table', icon: <List /> },
          { value: 'grid', label: 'Grid', icon: <LayoutGrid /> },
        ]}
      />
    </div>
  )
}
