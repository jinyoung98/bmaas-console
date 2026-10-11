import { Info } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/** 화면을 나누는 기본 단위. 카드가 아니라 "제목줄이 있는 선 박스"다 */
export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-lg border bg-surface', className)} {...props} />
}

type HeaderProps = {
  title: string
  /** 숫자의 기준처럼 읽는 사람이 오해할 수 있는 것만 적는 한 줄. 제목 옆 아이콘에 올리면 툴팁으로 나온다 */
  info?: string
  actions?: ReactNode
  className?: string
}

/**
 * 제목줄 높이는 기간 선택(SegmentedControl, 28px)이 들어가는 줄에 맞춰 46px로 고정한다. 루트 폰트가 14px라 rem 높이는
 * 버튼 유무에 따라 3.5px씩 달라져서 나란한 패널의 제목줄 아래 선이 어긋났다.
 */
export function PanelHeader({ title, info, actions, className }: HeaderProps) {
  return (
    <header className={cn('flex min-h-[46px] items-center justify-between gap-4 border-b px-5 py-2.5', className)}>
      <div className="flex min-w-0 items-center gap-[6px]">
        <h2 className="text-sm font-semibold">{title}</h2>
        {info && (
          <Tooltip content={info} side="bottom">
            <button
              type="button"
              aria-label={`${title} 설명`}
              className="grid size-[18px] cursor-pointer place-items-center rounded-full text-ink-mute outline-none transition-colors hover:text-ink focus-visible:text-ink"
            >
              <Info className="size-[14px]" strokeWidth={1.8} />
            </button>
          </Tooltip>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}

export function PanelBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}
