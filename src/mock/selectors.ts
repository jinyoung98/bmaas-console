import { STATUS_ORDER, type ServerStatus } from '@/lib/status'
import { regions } from './regions'
import type { Region, Server } from './types'

export function statusCounts(servers: Server[]): Record<ServerStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ServerStatus, number>
  for (const s of servers) counts[s.status] += 1
  return counts
}

export function groupByRegion(servers: Server[]): { region: Region; servers: Server[] }[] {
  return regions.map((region) => ({ region, servers: servers.filter((s) => s.region === region.id) }))
}

export const recentlyUpdated = (servers: Server[], n: number) =>
  [...servers].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, n)
