import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/cn'
import type { NavItem } from './navigation'

type TocProps = { items: NavItem[]; active: string; onSelect: (id: string) => void }

/** 넓은 폭(xl 이상): 왼쪽에 붙어 있는 층별 목차. 현재 항목은 왼쪽 2px ink 막대 + ink 색 */
export function DesignToc({ items, active, onSelect }: TocProps) {
  return (
    <nav aria-label="Design system 목차" className="sticky top-[51px] max-h-[calc(100dvh-100px)] overflow-y-auto py-[24px] pl-[32px] pr-[16px]">
      <ul className="grid gap-[2px]">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onSelect(it.id)
                }}
                className={cn(
                  'block border-l-2 py-[5px] pl-[12px] pr-[8px] text-[13px] leading-[20px] transition-colors hover:text-ink',
                  on ? 'border-accent font-medium text-ink' : 'border-line text-ink-mute',
                )}
              >
                {it.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** 좁은 폭(xl 미만): 목차 대신 현재 블록 이름이 담긴 선택 메뉴 한 줄 */
export function DesignBlockMenu({ items, active, onSelect }: TocProps) {
  const current = items.find((i) => i.id === active) ?? items[0]
  return (
    <div className="flex h-[40px] items-center border-b px-5 md:px-8 xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="max-w-full justify-between gap-[8px]" aria-label="블록 이동">
            <span className="truncate">{current.title}</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[60dvh] min-w-[220px] overflow-y-auto">
          {items.map((it) => (
            <DropdownMenuItem key={it.id} onSelect={() => onSelect(it.id)} className={cn(it.id === active && 'font-medium')}>
              <span className="min-w-0 flex-1 truncate">{it.title}</span>
              {it.id === active && <Check className="!text-ink" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
