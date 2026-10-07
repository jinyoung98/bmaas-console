import { cn } from '@/lib/cn'

type Props = {
  /** 0~100 */
  value: number
  className?: string
  /** true면 임계값(75/90)에서 앰버, 레드로 바뀐다 */
  alert?: boolean
}

/** 사용률 막대. 평소엔 브랜드 그린, 임계값을 넘으면 상태 색으로 바뀐다 */
export function Meter({ value, className, alert = true }: Props) {
  const v = Math.max(0, Math.min(100, value))
  const tone = !alert ? 'bg-accent' : v >= 90 ? 'bg-st-error' : v >= 75 ? 'bg-st-warning' : 'bg-accent'
  return (
    <div
      role="meter"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-sunken', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone)} style={{ width: `${v}%` }} />
    </div>
  )
}
