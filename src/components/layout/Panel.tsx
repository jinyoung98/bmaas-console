import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** 화면을 나누는 기본 단위. 카드가 아니라 "제목줄이 있는 선 박스"다 */
export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-lg border bg-surface', className)} {...props} />
}

type HeaderProps = { title: string; actions?: ReactNode; className?: string }

/**
 * 제목줄 높이는 기간 선택(SegmentedControl, 28px)이 들어가는 줄에 맞춰 46px로 고정한다. 루트 폰트가 14px라 rem 높이는
 * 버튼 유무에 따라 3.5px씩 달라져서 나란한 패널의 제목줄 아래 선이 어긋났다.
 */
export function PanelHeader({ title, actions, className }: HeaderProps) {
  return (
    <header className={cn('flex min-h-[46px] items-center justify-between gap-4 border-b px-5 py-2.5', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}

export function PanelBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}
