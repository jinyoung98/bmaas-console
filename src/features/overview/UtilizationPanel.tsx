import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AreaChart } from '@/components/data/AreaChart'
import { Value } from '@/components/data/Mono'
import { Sparkline } from '@/components/data/Sparkline'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'
import { formatClock, type Range } from '@/lib/format'
import { getSeries, METRIC_ORDER, METRICS, seriesChange, type Metric } from '@/mock/metrics'

type Props = { means: Record<Metric, number> }

const RANGES = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
] as const

const RANGE_LABEL: Record<Range, string> = { '1h': '최근 1시간', '24h': '최근 24시간', '7d': '최근 7일' }

/** 네 지표를 카드로 나열하지 않고, 한 패널 안의 탭처럼 묶어서 하나의 차트를 바꿔 보여준다 */
export function UtilizationPanel({ means }: Props) {
  const [metric, setMetric] = useState<Metric>('cpu')
  const [range, setRange] = useState<Range>('24h')

  const series = useMemo(
    () => Object.fromEntries(METRIC_ORDER.map((m, i) => [m, getSeries(m, range, means[m], i + 1)])) as Record<Metric, ReturnType<typeof getSeries>>,
    [means, range],
  )
  const info = METRICS[metric]
  const data = series[metric]
  const isPercent = info.percent

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title="Resource utilization"
        description={`${RANGE_LABEL[range]} · 가동 중인 서버 기준`}
        actions={<SegmentedControl value={range} onValueChange={setRange} options={[...RANGES]} />}
      />

      <div className="grid grid-cols-2 divide-x divide-y border-b sm:grid-cols-4 sm:divide-y-0">
        {METRIC_ORDER.map((m) => {
          const d = series[m]
          const change = seriesChange(d, METRICS[m].percent)
          const active = m === metric
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              aria-pressed={active}
              className={cn(
                "relative cursor-pointer px-5 py-4 text-left transition-colors hover:bg-accent-subtle after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-opacity after:content-['']",
                active ? 'bg-accent-subtle after:opacity-100' : 'after:opacity-0',
              )}
            >
              <span className="text-xs text-ink-mute">
                {METRICS[m].label} <span className="opacity-60">· {METRICS[m].agg}</span>
              </span>
              <span className="mt-1 flex items-end justify-between gap-2">
                <Value value={means[m]} unit={METRICS[m].unit} className="text-xl font-semibold tracking-tight" />
                <Sparkline data={d.map((p) => p.v)} width={56} height={22} className={active ? 'text-accent' : 'text-ink-mute'} />
              </span>
              <span className="num mt-1 flex items-center gap-0.5 text-xs text-ink-mute">
                {change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {Math.abs(change).toFixed(1)}
                {METRICS[m].percent ? '%p' : '%'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 px-4 pb-4 pt-5">
        <AreaChart
          data={data}
          unit={info.unit}
          domain={isPercent ? [0, 100] : [0, 'auto']}
          formatAxis={isPercent ? (v) => `${v}%` : undefined}
          formatTick={(t) => formatClock(t, range)}
          formatTooltipTime={(t) => formatClock(t, range, true)}
        />
      </div>
    </Panel>
  )
}
