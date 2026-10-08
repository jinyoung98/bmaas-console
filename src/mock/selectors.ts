import { STATUS_ORDER, type ServerStatus } from '@/lib/status'
import { regions } from './regions'
import type { Region, RegionId, Server } from './types'

export function statusCounts(servers: Server[]): Record<ServerStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ServerStatus, number>
  for (const s of servers) counts[s.status] += 1
  return counts
}

export function groupByRegion(servers: Server[]): { region: Region; servers: Server[] }[] {
  return regions.map((region) => ({ region, servers: servers.filter((s) => s.region === region.id) }))
}

export type ServerFilter = { q?: string; status?: ServerStatus | null; region?: RegionId | null; gpu?: boolean }

/** 검색어는 호스트명과 IP에 부분 일치. gpu는 GPU가 달린 서버만. 비어 있는 조건은 건너뛴다 */
export function filterServers(servers: Server[], { q, status, region, gpu }: ServerFilter): Server[] {
  const needle = q?.trim().toLowerCase()
  return servers.filter(
    (s) =>
      (!status || s.status === status) &&
      (!region || s.region === region) &&
      (!gpu || s.gpu !== undefined) &&
      (!needle || s.hostname.toLowerCase().includes(needle) || s.ip.includes(needle)),
  )
}

export const recentlyUpdated = (servers: Server[], n: number) =>
  [...servers].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, n)
