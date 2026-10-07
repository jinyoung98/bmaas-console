import { cn } from '@/lib/cn'

export type StackSegment = { key: string; label: string; value: number; className: string }

type Props = {
  segments: StackSegment[]
  /** 구간 안에 개수를 쓴다. 숫자가 잘리지 않도록 구간 최소 폭이 24px로 커진다 */
  showValues?: boolean
  className?: string
}

/**
 * 전체 대비 구성비를 한 줄로 보여준다. 구간 사이 틈이 "벽돌" 느낌을 만든다.
 * 높이와 틈은 className으로 정한다(기본 8px / 2px). 라운드는 바깥에만 두고 구간은 잘리게 한다.
 */
export function StackBar({ segments, showValues = false, className }: Props) {
  return (
    <div
      role="img"
      aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}
      className={cn('flex h-[8px] gap-[2px] overflow-hidden rounded-sm', className)}
    >
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.key}
            aria-hidden
            className={cn('overflow-hidden', showValues ? 'min-w-[24px]' : 'min-w-[6px]', s.className)}
            style={{ flex: `${s.value} 1 0` }}
          >
            {/* 패딩을 바깥 구간에 주면 flex-basis 0 위에 더해져 비율이 틀어진다. 안쪽에 두고 넘치는 오른쪽 패딩은 잘리게 둔다 */}
            {showValues && (
              <span className="num flex h-full items-center whitespace-nowrap px-[8px] text-xs font-semibold text-bg">{s.value}</span>
            )}
          </div>
        ))}
    </div>
  )
}
