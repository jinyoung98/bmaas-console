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
  gpu: boolean
  view: ServerView
  /** 상태 필터만 뺀 결과 안에서의 상태별 개수 */
  counts: Record<ServerStatus, number>
  /** 같은 기준에서 GPU가 달린 서버 수 */
  gpuCount: number
  onSearch: (q: string) => void
  onStatus: (s: ServerStatus | null) => void
  onRegion: (r: RegionId | null) => void
  onGpu: (on: boolean) => void
  onView: (v: ServerView) => void
  /** 보기 설정 묶음 맨 앞에 붙는 컨트롤(표 보기의 Columns 메뉴) */
  extra?: ReactNode
}

const chip = (on: boolean) =>
  cn(
    'flex h-[32px] cursor-pointer items-center gap-[6px] rounded-sm border bg-raised px-[10px] text-sm transition-colors',
    'hover:border-line-strong hover:bg-accent-subtle',
    on ? 'border-line-strong bg-accent-subtle text-ink' : 'border-line text-ink-soft',
  )

function Chip({ on, onClick, swatch, label, count }: { on: boolean; onClick: () => void; swatch: string; label: string; count: number }) {
  return (
    <li>
      <button type="button" aria-pressed={on} onClick={onClick} className={chip(on)}>
        <span className={cn('size-[8px] rounded-[2px]', swatch)} />
        {label}
        <Value value={count} className={cn('text-xs font-semibold', on ? 'text-ink' : 'text-ink-mute')} />
      </button>
    </li>
  )
}

/**
 * 2행 툴바. 1행은 왼쪽 검색, 오른쪽 보기 설정 묶음(Columns · 리전 · Table/Grid)으로, 줄이 바뀌어도 묶음은 흩어지지 않는다.
 * 2행은 상태 칩 5개와 GPU 칩. 칩은 Overview Fleet status 칩과 같은 생김새이고, 누르면 필터가 켜지고 꺼진다.
 */
export function ServerToolbar(props: Props) {
  const { q, status, region, gpu, view, counts, gpuCount, onSearch, onStatus, onRegion, onGpu, onView, extra } = props
  return (
    <div className="grid gap-[8px]">
      <div className="flex flex-wrap items-center gap-[8px]">
        <Input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="호스트명, IP 검색"
          aria-label="호스트명, IP 검색"
          icon={<Search />}
          wrapperClassName="h-[32px] min-w-[200px] flex-1 sm:max-w-[320px]"
        />

        <div className="ml-auto flex items-center gap-[8px]">
          {extra}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-[32px] cursor-pointer items-center gap-[8px] whitespace-nowrap rounded-sm border bg-raised px-[10px] text-sm text-ink-soft transition-colors hover:border-line-strong data-[state=open]:border-line-strong"
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
      </div>

      <ul className="flex flex-wrap gap-[6px]" aria-label="필터">
        {STATUS_ORDER.map((s) => (
          <Chip
            key={s}
            on={status === s}
            onClick={() => onStatus(status === s ? null : s)}
            swatch={STATUS_BG[s]}
            label={STATUS_LABEL[s]}
            count={counts[s]}
          />
        ))}
        {/* GPU는 상태가 아니라 유형이라 색 없이 윤곽선 스와치로 구분한다 */}
        <Chip on={gpu} onClick={() => onGpu(!gpu)} swatch="border border-ink-mute" label="GPU" count={gpuCount} />
      </ul>
    </div>
  )
}
