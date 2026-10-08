import { Area, AreaChart as RAreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useId, type ReactNode } from 'react'
import { Value } from './Mono'

export type ChartPoint = { t: number; v: number }

type Props = {
  data: ChartPoint[]
  /** 생략하면 부모 크기를 가득 채운다. 부모에 높이가 있어야 한다 */
  height?: number
  /** 값 축 범위. 퍼센트 지표는 [0, 100]으로 고정해서 모양이 과장되지 않게 한다 */
  domain?: [number, number | 'auto']
  unit: string
  formatTick: (t: number) => string
  formatTooltipTime: (t: number) => ReactNode
  /** 값 축 눈금 표기 */
  formatAxis?: (v: number) => string
  /** 알림 기준선. 점선으로 가로지른다 */
  threshold?: number
}

const AXIS_TICK = { fill: 'var(--ink-mute)', fontSize: 11, fontFamily: 'var(--font-mono)' }

/** Recharts를 토큰 색으로 재스타일한 단색 영역 차트 */
export function AreaChart({ data, height, domain = [0, 100], unit, formatTick, formatTooltipTime, formatAxis, threshold }: Props) {
  const id = useId()

  return (
    <div style={height ? { height } : undefined} className={height ? 'w-full' : 'size-full'}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 8, right: 32, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity={0.22} />
              <stop offset="1" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTick}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
            tickMargin={8}
          />
          <YAxis
            domain={domain}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={formatAxis}
            tickCount={5}
          />
          {threshold !== undefined && (
            <ReferenceLine y={threshold} stroke="var(--st-warning)" strokeDasharray="4 4" strokeOpacity={0.7} />
          )}
          <Tooltip
            cursor={{ stroke: 'var(--line-strong)' }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as ChartPoint
              return (
                <div className="rounded-md border bg-raised px-2.5 py-1.5 shadow-[0_4px_16px_rgb(0_0_0/0.12)]">
                  <p className="text-xs text-ink-mute">{formatTooltipTime(p.t)}</p>
                  <Value value={p.v} unit={unit} className="text-sm font-medium" />
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--accent)"
            strokeWidth={1.75}
            fill={`url(#${id})`}
            animationDuration={500}
            activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
          />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
