import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/** 브랜드 사이트의 eyebrow(넓은 자간 대문자 라벨)를 그대로 옮긴 섹션 라벨 */
export function Eyebrow({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-mute', className)}
      {...props}
    />
  )
}
