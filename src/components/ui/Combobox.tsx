import { Command } from 'cmdk'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { selectTrigger, type SelectOption } from '@/components/ui/Select'
import { cn } from '@/lib/cn'

type Props<T extends string> = {
  /** null = 전체(필터 없음) */
  value: T | null
  onChange: (value: T | null) => void
  options: SelectOption<T>[]
  allLabel: string
  searchPlaceholder: string
  emptyText: string
  align?: 'start' | 'end'
  className?: string
}

const item =
  'flex h-[30px] cursor-pointer items-center gap-[8px] rounded-sm px-[8px] text-sm data-[selected=true]:bg-accent-subtle'

/**
 * 항목이 많아 검색이 필요한 필터용 선택 상자(서버 48대 등). Select와 같은 트리거에 검색창과 목록이 팝오버로 열린다.
 * 서버 상세의 "View all"로 들어오면 이미 선택된 상태로 열린다. 항목이 몇 개 안 되면 Select를 쓴다.
 */
export function Combobox<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  searchPlaceholder,
  emptyText,
  align = 'end',
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  const pick = (v: T | null) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(selectTrigger, className)}>
          {current ? <span className="num text-ink">{current.label}</span> : allLabel}
          <ChevronDown className="size-[14px] text-ink-mute" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[260px] p-0">
        <Command>
          <div className="flex items-center gap-[8px] border-b px-[12px]">
            <Search className="size-[14px] text-ink-mute" />
            <Command.Input
              placeholder={searchPlaceholder}
              className="h-[36px] min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-mute"
            />
          </div>
          <Command.List className="max-h-[280px] overflow-y-auto p-[4px]">
            <Command.Empty className="px-[12px] py-[16px] text-center text-xs text-ink-mute">{emptyText}</Command.Empty>
            <Command.Item value={allLabel} onSelect={() => pick(null)} className={item}>
              <Check className={cn('size-[14px]', value !== null && 'opacity-0')} />
              {allLabel}
            </Command.Item>
            {options.map((o) => (
              <Command.Item key={o.value} value={o.value} onSelect={() => pick(o.value)} className={item}>
                <Check className={cn('size-[14px]', value !== o.value && 'opacity-0')} />
                <span className="num">{o.label}</span>
                {o.hint && <span className="ml-auto text-xs text-ink-mute">{o.hint}</span>}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
