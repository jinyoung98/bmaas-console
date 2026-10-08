import { Command } from 'cmdk'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Value } from '@/components/data/Mono'
import { Input } from '@/components/ui/Input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
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

/** 서버 48대 중 하나를 고르는 검색 가능한 목록. 서버 상세의 "View all"로 들어오면 이미 선택된 상태다 */
function ServerPicker({ value, onChange }: { value: string | null; onChange: (hostname: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const pick = (hostname: string | null) => {
    onChange(hostname)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-[32px] cursor-pointer items-center gap-[8px] whitespace-nowrap rounded-sm border bg-raised px-[10px] text-sm text-ink-soft transition-colors hover:border-line-strong data-[state=open]:border-line-strong"
        >
          {value ? <span className="num text-ink">{value}</span> : '모든 서버'}
          <ChevronDown className="size-[14px] text-ink-mute" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-0">
        <Command>
          <div className="flex items-center gap-[8px] border-b px-[12px]">
            <Search className="size-[14px] text-ink-mute" />
            <Command.Input
              placeholder="서버 검색"
              className="h-[36px] min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-mute"
            />
          </div>
          <Command.List className="max-h-[280px] overflow-y-auto p-[4px]">
            <Command.Empty className="px-[12px] py-[16px] text-center text-xs text-ink-mute">일치하는 서버가 없습니다</Command.Empty>
            <Command.Item
              value="모든 서버"
              onSelect={() => pick(null)}
              className="flex h-[30px] cursor-pointer items-center gap-[8px] rounded-sm px-[8px] text-sm data-[selected=true]:bg-accent-subtle"
            >
              {!value ? <Check className="size-[14px]" /> : <X className="size-[14px] opacity-0" />}
              모든 서버
            </Command.Item>
            {servers.map((s) => (
              <Command.Item
                key={s.id}
                value={s.hostname}
                onSelect={() => pick(s.hostname)}
                className="flex h-[30px] cursor-pointer items-center gap-[8px] rounded-sm px-[8px] text-sm data-[selected=true]:bg-accent-subtle"
              >
                {value === s.hostname ? <Check className="size-[14px]" /> : <Check className="size-[14px] opacity-0" />}
                <span className="num">{s.hostname}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

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
          <ServerPicker value={server} onChange={onServer} />
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
