import type { ComponentProps, ReactNode } from 'react'
import { Eyebrow } from '@/components/common/Eyebrow'
import { cn } from '@/lib/cn'

/**
 * 박스 없는 영역. Panel이 "구조가 있는 데이터"(표, 차트)를 담는다면
 * Section은 페이지 위에 바로 놓이는 요약이나 목록을 담는다.
 * 모든 영역이 같은 박스로 보이는 것을 막아 중요도를 구분한다.
 */
export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn(className)} {...props} />
}

type HeaderProps = { title: string; actions?: ReactNode; className?: string }

export function SectionHeader({ title, actions, className }: HeaderProps) {
  return (
    <header className={cn('flex items-center justify-between gap-4', className)}>
      <Eyebrow>{title}</Eyebrow>
      {actions}
    </header>
  )
}
