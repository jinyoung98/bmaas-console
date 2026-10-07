import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/** 호스트명, IP, 모델명 등 "기계가 말하는 값". 본문과 시각적으로 구분하는 단일 진입점 */
export function Mono({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('num', className)} {...props} />
}

type ValueProps = ComponentProps<'span'> & {
  value: string | number
  unit?: string
}

/** 수치 + 단위. 단위는 한 단계 흐리게 해서 숫자가 먼저 읽히게 한다 */
export function Value({ value, unit, className, ...props }: ValueProps) {
  return (
    <span className={cn('num', className)} {...props}>
      {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      {unit && <span className="ml-0.5 text-[0.85em] text-ink-mute">{unit}</span>}
    </span>
  )
}
