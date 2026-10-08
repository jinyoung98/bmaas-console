import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Sparkline } from '@/components/data/Sparkline'
import { Value } from '@/components/data/Mono'
import { cn } from '@/lib/cn'
import { seriesChange, type MetricInfo, type Point } from '@/mock/metrics'

type Props<K extends string> = {
  keys: K[]
  info: Record<K, MetricInfo>
  means: Record<K, number>
  series: Record<K, Point[]>
  active: K
  onSelect: (key: K) => void
  /** 칸 수는 Tailwind가 정적으로 찾을 수 있게 전체 클래스로 받는다 */
  className?: string
}

/** 지표를 카드로 나열하지 않고 차트 위의 탭처럼 묶는다: 이름 · 현재값 · 스파크라인 · 구간 변화. Overview와 서버 상세가 같이 쓴다 */
export function MetricTabs<K extends string>({
  keys,
  info,
  means,
  series,
  active,
  onSelect,
  className = 'grid-cols-2 sm:grid-cols-4 sm:divide-y-0',
}: Props<K>) {
  return (
    <div className={cn('grid divide-x divide-y border-b', className)}>
      {keys.map((m) => {
        const d = series[m]
        const change = seriesChange(d, info[m].percent)
        const on = m === active
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(m)}
            aria-pressed={on}
            className={cn(
              "relative cursor-pointer px-5 py-4 text-left transition-colors hover:bg-accent-subtle after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-opacity after:content-['']",
              on ? 'bg-accent-subtle after:opacity-100' : 'after:opacity-0',
            )}
          >
            <span className="text-xs text-ink-mute">
              {info[m].label} {info[m].agg && <span className="opacity-60">· {info[m].agg}</span>}
            </span>
            <span className="mt-1 flex items-end justify-between gap-2">
              <Value value={means[m]} unit={info[m].unit} className="text-xl font-semibold tracking-tight" />
              <Sparkline data={d.map((p) => p.v)} width={56} height={22} className={on ? 'text-accent' : 'text-ink-mute'} />
            </span>
            <span className="num mt-1 flex items-center gap-0.5 text-xs text-ink-mute">
              {change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(change).toFixed(1)}
              {info[m].percent ? '%p' : '%'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
