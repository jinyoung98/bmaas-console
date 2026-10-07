import { cn } from '@/lib/cn'

export type StackSegment = { key: string; label: string; value: number; className: string }

type Props = { segments: StackSegment[]; className?: string }

/** 전체 대비 구성비를 한 줄로 보여준다. 조각 사이 2px 틈이 "벽돌" 느낌을 만든다 */
export function StackBar({ segments, className }: Props) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  return (
    <div className={cn('flex h-2 w-full gap-0.5', className)} role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.key}
            className={cn('h-full rounded-[2px] transition-[flex-grow] duration-500', s.className)}
            style={{ flexGrow: s.value / total, flexBasis: 0 }}
          />
        ))}
    </div>
  )
}
