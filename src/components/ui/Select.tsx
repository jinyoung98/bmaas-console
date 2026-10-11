import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/cn'

/** Select와 Combobox가 같이 쓰는 트리거. 32px 높이의 테두리 버튼에 값과 ▾를 놓는다. 툴바의 칩, 검색창과 높이가 같다 */
export const selectTrigger =
  'flex h-[32px] cursor-pointer items-center gap-[8px] whitespace-nowrap rounded-sm border bg-raised px-[10px] text-sm text-ink-soft transition-colors hover:border-line-strong data-[state=open]:border-line-strong'

export type SelectOption<T extends string = string> = {
  value: T
  label: string
  /** 라벨 오른쪽에 흐리게 붙는 보조값(위치 id 등). 닫힌 트리거에도 같이 보인다 */
  hint?: string
}

type Props<T extends string> = {
  /** null = 전체(필터 없음) */
  value: T | null
  onChange: (value: T | null) => void
  options: SelectOption<T>[]
  /** 필터가 없을 때의 이름. 목록 맨 위 항목이자 트리거의 기본 글자 ("모든 위치") */
  allLabel: string
  align?: 'start' | 'end'
  className?: string
}

const ALL = '__all__'

/**
 * 항목이 몇 개 안 되는 필터용 선택 상자(위치 4곳 등). 메뉴 맨 위에 "전체" 항목이 있고 구분선 아래에 선택지가 이어진다.
 * 항목이 열 개를 넘어 검색이 필요하면 Combobox를 쓴다.
 */
export function Select<T extends string>({ value, onChange, options, allLabel, align = 'end', className }: Props<T>) {
  const current = options.find((o) => o.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(selectTrigger, className)}>
          {current ? (
            <>
              {current.label}
              {current.hint && <span className="num text-xs text-ink-mute">{current.hint}</span>}
            </>
          ) : (
            allLabel
          )}
          <ChevronDown className="size-[14px] text-ink-mute" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuRadioGroup value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : (v as T))}>
          <DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
              {o.hint && <span className="num ml-auto text-xs text-ink-mute">{o.hint}</span>}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
