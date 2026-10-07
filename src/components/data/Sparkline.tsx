import { useId } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  data: number[]
  width?: number
  height?: number
  className?: string
}

/** 축도 툴팁도 없는 추세선. 색은 currentColor라서 부모의 text-* 로 정한다 */
export function Sparkline({ data, width = 96, height = 28, className }: Props) {
  const id = useId()
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pad = 2
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - pad - ((d - min) / span) * (height - pad * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width} ${height} L0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={cn('text-accent', className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
