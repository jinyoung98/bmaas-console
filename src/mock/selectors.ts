import { STATUS_ORDER, type ServerStatus } from '@/lib/status'
import { activity } from './activity'
import { regions } from './regions'
import type { ActivityEvent, Region, RegionId, Server } from './types'

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

/* ---------- 서버 상세 ---------- */

const hashOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7)

/**
 * 한 서버의 활동, 최신순. mock/activity의 해당 호스트 이벤트에 생성·배포·OS 재설치 같은 합성 이벤트를 더한다.
 * 합성 이벤트의 시각은 서버 id로 정해져서 새로고침해도 같다.
 */
export function serverActivity(s: Server): ActivityEvent[] {
  const h = hashOf(s.id)
  const events: ActivityEvent[] = activity.filter((e) => e.hostname === s.hostname)
  events.push({ id: `${s.id}-created`, severity: 'available', hostname: s.hostname, text: '서버가 생성되었습니다', at: s.createdAt })
  if (s.os) {
    events.push({
      id: `${s.id}-deployed`,
      severity: 'running',
      hostname: s.hostname,
      text: '배포가 완료되었습니다',
      at: s.createdAt + (6 + (h % 9)) * 60_000,
    })
    if (h % 3 === 0 && !events.some((e) => e.text.includes('재설치'))) {
      events.push({
        id: `${s.id}-reinstall`,
        severity: 'running',
        hostname: s.hostname,
        text: `${s.os}로 OS가 재설치되었습니다`,
        at: Math.max(s.createdAt + 2 * 86_400_000, s.updatedAt - (h % 5) * 86_400_000),
      })
    }
  }
  return events.sort((a, b) => b.at - a.at)
}

/** 알림 줄에 쓸 사유: 그 서버의 가장 최근 해당 severity 이벤트 */
export const latestEventOf = (s: Server, severity: ActivityEvent['severity']) =>
  serverActivity(s).find((e) => e.severity === severity)

export type NetworkInterface = { name: string; speedGbps: number; ip: string; network: string; up: boolean }

const VLANS = ['vlan-prod', 'vlan-train', 'vlan-data', 'vlan-mgmt']

/** 포트 수만큼. eth0은 서버 IP, eth1은 마지막 옥텟 +1. 응답 없는 서버(error)는 모두 Down */
export function serverInterfaces(s: Server): NetworkInterface[] {
  const [a, b, c, d] = s.ip.split('.').map(Number)
  const h = hashOf(s.id)
  return Array.from({ length: s.network.ports }, (_, i) => ({
    name: `eth${i}`,
    speedGbps: s.network.speedGbps,
    ip: `${a}.${b}.${c}.${d + i}`,
    network: VLANS[(h + i) % (s.gpu ? 2 : 3)],
    up: s.status !== 'error',
  }))
}

/** 서브넷(/24) 기준 게이트웨이와 DNS */
export function serverNetworkInfo(s: Server) {
  const [a, b, c] = s.ip.split('.')
  return { gateway: `${a}.${b}.${c}.1`, dns: `${a}.${b}.${c}.2` }
}

/** 등록된 SSH 키 이름. 서버마다 두 개 */
const SSH_KEYS = ['jinyoung-macbook', 'ci-deploy', 'ops-shared']
export function serverSshKeys(s: Server): string[] {
  const h = hashOf(s.id)
  return [SSH_KEYS[0], SSH_KEYS[1 + (h % 2)]]
}
