import { useMemo, useState } from 'react'
import { AreaChart } from '@/components/data/AreaChart'
import { MetricTabs } from '@/components/data/MetricTabs'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatClock, RANGE_LABEL, RANGES, type Range } from '@/lib/format'
import { getSeries, METRIC_ORDER, METRICS, type MetricInfo, type Point } from '@/mock/metrics'

type Props<K extends string> = {
  means: Record<K, number>
  /** 기본은 플릿 평균(Overview). 서버 상세는 그 서버의 지표와 시계열을 넘긴다 */
  keys?: K[]
  info?: Record<K, MetricInfo>
  getData?: (key: K, range: Range, index: number) => Point[]
  title?: string
  description?: (rangeLabel: string) => string
}

/** 네 지표를 카드로 나열하지 않고, 한 패널 안의 탭처럼 묶어서 하나의 차트를 바꿔 보여준다 */
export function UtilizationPanel<K extends string = 'cpu' | 'memory' | 'storage' | 'network'>({
  means,
  keys = METRIC_ORDER as unknown as K[],
  info = METRICS as unknown as Record<K, MetricInfo>,
  getData = (m, range, i) => getSeries(m as never, range, means[m], i + 1),
  title = 'Resource utilization',
  description = (label) => `${label} · 가동 중인 서버 기준`,
}: Props<K>) {
  const [metric, setMetric] = useState<K>(keys[0])
  const [range, setRange] = useState<Range>('24h')

  // 지표 정의는 호출하는 쪽에서 모듈 상수로 넘기므로 의존성에 넣어도 다시 계산되지 않는다
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const series = useMemo(() => Object.fromEntries(keys.map((m, i) => [m, getData(m, range, i)])) as Record<K, Point[]>, [means, range])
  const data = series[metric]
  const isPercent = info[metric].percent

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title={title}
        description={description(RANGE_LABEL[range])}
        actions={<SegmentedControl value={range} onValueChange={setRange} options={[...RANGES]} />}
      />

      <MetricTabs keys={keys} info={info} means={means} series={series} active={metric} onSelect={setMetric} />

      {/* 옆 패널(Locations)이 더 길면 차트가 그만큼 늘어나서 두 패널의 바닥이 맞는다 */}
      <div className="relative min-h-[300px] flex-1">
        <div className="absolute inset-x-4 bottom-4 top-5">
          <AreaChart
            data={data}
            unit={info[metric].unit}
            domain={isPercent ? [0, 100] : [0, 'auto']}
            formatAxis={isPercent ? (v) => `${v}%` : undefined}
            formatTick={(t) => formatClock(t, range)}
            formatTooltipTime={(t) => formatClock(t, range, true)}
          />
        </div>
      </div>
    </Panel>
  )
}
