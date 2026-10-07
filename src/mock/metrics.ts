import type { Range } from '@/lib/format'
import type { Server } from './types'

export type Metric = 'cpu' | 'memory' | 'storage' | 'network'
export type Point = { t: number; v: number }

/** agg: 플릿 전체 값을 어떻게 합쳤는지. 퍼센트는 평균, 대역폭은 서버마다 회선 속도가 달라 합계 */
export const METRICS: Record<Metric, { label: string; unit: string; percent: boolean; agg: '평균' | '합계' }> = {
  cpu: { label: 'CPU', unit: '%', percent: true, agg: '평균' },
  memory: { label: 'Memory', unit: '%', percent: true, agg: '평균' },
  storage: { label: 'Storage', unit: '%', percent: true, agg: '평균' },
  network: { label: 'Network', unit: 'Tbps', percent: false, agg: '합계' },
}

export const METRIC_ORDER: Metric[] = ['cpu', 'memory', 'storage', 'network']

const STEP: Record<Range, { points: number; ms: number }> = {
  '1h': { points: 60, ms: 60_000 },
  '24h': { points: 96, ms: 15 * 60_000 },
  '7d': { points: 168, ms: 3_600_000 },
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86_400_000

/**
 * 현재 평균값(mean)에 맞춰 하루 주기의 파동과 잡음을 얹은 시계열.
 * 끝점이 항상 mean 근처라서 "지금 값"과 차트가 어긋나지 않는다.
 */
export function getSeries(metric: Metric, range: Range, mean: number, seed = 1): Point[] {
  const { points, ms } = STEP[range]
  const rnd = mulberry32(seed * 131 + points + metric.length * 17)
  const end = Math.floor(Date.now() / ms) * ms
  const percent = METRICS[metric].percent
  const amp = metric === 'storage' ? 0 : mean * 0.12
  const noise = metric === 'storage' ? 0.15 : mean * 0.045
  const max = percent ? 98 : Infinity

  let drift = 0
  return Array.from({ length: points }, (_, i) => {
    const t = end - (points - 1 - i) * ms
    const wave = Math.sin(((t % DAY) / DAY) * Math.PI * 2 - Math.PI / 2) * amp
    drift += (rnd() - 0.5) * noise * 0.6
    drift *= 0.94
    // 스토리지는 천천히 차오르는 모양
    const trend = metric === 'storage' ? -((points - 1 - i) / points) * 2.4 : 0
    const v = Math.max(1, Math.min(max, mean + wave + drift + (rnd() - 0.5) * noise + trend))
    return { t, v: +v.toFixed(2) }
  })
}

/** 구간 앞쪽 4분의 1 평균과 뒤쪽 4분의 1 평균의 차이 */
export function seriesChange(data: Point[], percent: boolean) {
  const q = Math.max(1, Math.floor(data.length / 4))
  const avg = (xs: Point[]) => xs.reduce((s, p) => s + p.v, 0) / xs.length
  const a = avg(data.slice(0, q))
  const b = avg(data.slice(-q))
  return percent ? b - a : ((b - a) / a) * 100
}

/** 서버 목록에서 플릿 전체의 현재 평균을 구한다. 네트워크는 사용 중인 대역폭의 합(Tbps) */
export function fleetMeans(servers: Server[]): Record<Metric, number> {
  const live = servers.filter((s) => s.status === 'running' || s.status === 'warning')
  const avg = (pick: (s: Server) => number) => live.reduce((sum, s) => sum + pick(s), 0) / Math.max(1, live.length)
  return {
    cpu: +avg((s) => s.usage.cpu).toFixed(1),
    memory: +avg((s) => s.usage.memory).toFixed(1),
    storage: +avg((s) => s.usage.storage).toFixed(1),
    network: +(live.reduce((sum, s) => sum + (s.usage.network / 100) * s.network.ports * s.network.speedGbps, 0) / 1000).toFixed(1),
  }
}
