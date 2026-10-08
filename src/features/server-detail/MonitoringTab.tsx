import { useMemo, useState } from 'react'
import { AreaChart } from '@/components/data/AreaChart'
import { MetricTabs } from '@/components/data/MetricTabs'
import { Value } from '@/components/data/Mono'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatClock, RANGE_LABEL, RANGES, type Range } from '@/lib/format'
import { isLiveStatus } from '@/lib/status'
import { DETAIL_METRICS, serverMeans, serverSeries, type DetailMetric, type Point } from '@/mock/metrics'
import type { Server } from '@/mock/types'
import { IdleNotice } from './IdleNotice'

const ALERT_AT = 75

const percentile = (data: Point[], p: number) => {
  const v = data.map((d) => d.v).sort((a, b) => a - b)
  return v[Math.min(v.length - 1, Math.ceil((p / 100) * v.length) - 1)]
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-[20px] py-[12px]">
      <dt className="text-xs text-ink-mute">{label}</dt>
      <dd className="mt-[2px] text-sm font-medium">{children}</dd>
    </div>
  )
}

export function MonitoringTab({ server: s }: { server: Server }) {
  const keys = useMemo<DetailMetric[]>(() => (s.gpu ? ['cpu', 'memory', 'gpu', 'storage', 'network'] : ['cpu', 'memory', 'storage', 'network']), [s])
  const [metric, setMetric] = useState<DetailMetric>('cpu')
  const [range, setRange] = useState<Range>('24h')
  const means = useMemo(() => serverMeans(s), [s])
  const series = useMemo(
    () => Object.fromEntries(keys.map((m) => [m, serverSeries(s, m, range)])) as Record<DetailMetric, Point[]>,
    [keys, s, range],
  )

  if (!isLiveStatus(s.status)) return <IdleNotice server={s} />

  const info = DETAIL_METRICS[metric]
  const data = series[metric]
  const values = data.map((d) => d.v)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const fmt = (v: number) => <Value value={+v.toFixed(1)} unit={info.unit} />

  return (
    <Panel>
      <PanelHeader
        title="Monitoring"
        description={`${RANGE_LABEL[range]} · ${s.hostname}`}
        actions={<SegmentedControl value={range} onValueChange={setRange} options={[...RANGES]} />}
      />
      <MetricTabs
        keys={keys}
        info={DETAIL_METRICS}
        means={means}
        series={series}
        active={metric}
        onSelect={setMetric}
        className={keys.length === 5 ? 'grid-cols-2 lg:grid-cols-5 lg:divide-y-0' : 'grid-cols-2 sm:grid-cols-4 sm:divide-y-0'}
      />
      <div role="img" aria-label={`${info.label} 사용률 차트. 평균 ${avg.toFixed(1)}${info.unit}, 최대 ${Math.max(...values).toFixed(1)}${info.unit}`} className="px-[16px] pb-[8px] pt-[20px]">
        <AreaChart
          data={data}
          height={240}
          unit={info.unit}
          domain={info.percent ? [0, 100] : [0, 'auto']}
          formatAxis={info.percent ? (v) => `${v}%` : undefined}
          formatTick={(t) => formatClock(t, range)}
          formatTooltipTime={(t) => formatClock(t, range, true)}
          threshold={info.percent ? ALERT_AT : undefined}
        />
      </div>
      <dl className="grid grid-cols-2 divide-x border-t sm:grid-cols-4 [&>div]:border-b sm:[&>div]:border-b-0 [&>div:nth-last-child(-n+2)]:border-b-0">
        <Stat label="평균">{fmt(avg)}</Stat>
        <Stat label="최대">{fmt(Math.max(...values))}</Stat>
        <Stat label="p95">{fmt(percentile(data, 95))}</Stat>
        <Stat label="임계값">
          {info.percent ? <span className="num">{ALERT_AT}% 초과 시 알림</span> : <span className="text-ink-mute">—</span>}
        </Stat>
      </dl>
    </Panel>
  )
}
