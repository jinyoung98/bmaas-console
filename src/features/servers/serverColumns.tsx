import { createGridColumns, type GridColumn } from '@/components/data/DataGrid/columns'
import { Mono, Value } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { formatKRW, formatUptime, relativeTime } from '@/lib/format'
import { isLiveStatus, STATUS_RANK } from '@/lib/status'
import { regionById } from '@/mock/regions'
import type { Server } from '@/mock/types'
import { ComputeCell, HostCell, UtilizationCell } from './ServerCells'

const sub = 'num block text-[11px] leading-4 text-ink-mute'
const col = createGridColumns<Server>()

/** 10.20.1.11 → 010020001011. 문자열 비교로도 IP 순서가 맞게 옥텟을 세 자리로 채운다 */
const ipKey = (ip: string) =>
  ip
    .split('.')
    .map((o) => o.padStart(3, '0'))
    .join('')

const hostname = {
  header: 'Hostname',
  sortFn: 'alphanumeric',
  meta: { label: 'Hostname', required: true },
} as const

/**
 * 서버 목록의 열. Overview(Recent servers)와 Servers가 같은 정의를 쓰고, 화면마다 필요한 열만 고른다.
 * accessor는 정렬 기준값이고, 화면에는 cell이 그린다.
 */
export const serverColumns = {
  /** 호스트명만. 상태는 status 열이 따로 보여준다(Servers) */
  hostname: col.accessor('hostname', {
    ...hostname,
    cell: ({ row: { original: s } }) => <HostCell server={s} />,
  }),
  /** 호스트명 옆에 상태 배지. 상태 열이 없는 짧은 표(Overview Recent servers) */
  hostnameWithStatus: col.accessor('hostname', {
    ...hostname,
    cell: ({ row: { original: s } }) => <HostCell server={s} withStatus />,
  }),
  /** 호스트명 아래에 IP. IP 열을 따로 두지 않는 목록(Servers) */
  hostnameWithIp: col.accessor('hostname', {
    ...hostname,
    cell: ({ row: { original: s } }) => <HostCell server={s} withIp />,
  }),
  /** 정렬은 이름순이 아니라 심각도순(오름차순 = Error가 위). 같은 상태끼리는 호스트명 오름차순 */
  status: col.accessor((s) => STATUS_RANK[s.status], {
    id: 'status',
    header: 'Status',
    sortFn: 'basic',
    meta: { label: 'Status', thenBy: 'hostname' },
    cell: ({ row: { original: s } }) => <StatusBadge status={s.status} />,
  }),
  location: col.accessor((s) => regionById[s.region].city, {
    id: 'location',
    header: 'Location',
    sortFn: 'alphanumeric',
    meta: { label: 'Location' },
    cell: ({ row: { original: s } }) => (
      <>
        {regionById[s.region].city}
        <span className={sub}>{s.region}</span>
      </>
    ),
  }),
  cpu: col.accessor('cores', {
    id: 'cpu',
    header: 'CPU',
    sortFn: 'basic',
    meta: { label: 'CPU' },
    cell: ({ row: { original: s } }) => (
      <>
        <Mono className="text-ink-soft">{s.cores} Core</Mono>
        <span className={sub}>{s.cpu.model}</span>
      </>
    ),
  }),
  memory: col.accessor('memoryGB', {
    id: 'memory',
    header: 'Memory',
    sortFn: 'basic',
    meta: { label: 'Memory', align: 'right' },
    cell: ({ row: { original: s } }) => <Value value={s.memoryGB} unit="GB" />,
  }),
  storage: col.accessor('storageTB', {
    id: 'storage',
    header: 'Storage',
    sortFn: 'basic',
    meta: { label: 'Storage', align: 'right' },
    cell: ({ row: { original: s } }) => <Value value={s.storageTB} unit="TB" />,
  }),
  ip: col.accessor((s) => ipKey(s.ip), {
    id: 'ip',
    header: 'IP address',
    sortFn: 'alphanumeric',
    meta: { label: 'IP address' },
    cell: ({ row: { original: s } }) => <Mono className="text-ink-soft">{s.ip}</Mono>,
  }),
  /** CPU 열을 대신한다. GPU 서버는 GPU 구성이 먼저. 정렬은 GPU 개수, 같으면 코어 수 */
  compute: col.accessor((s) => (s.gpu?.count ?? 0) * 10_000 + s.cores, {
    id: 'compute',
    header: 'Compute',
    sortFn: 'basic',
    meta: { label: 'Compute' },
    cell: ({ row: { original: s } }) => <ComputeCell server={s} />,
  }),
  /** CPU 사용률. 켜져 있지 않은 서버는 값이 없고 정렬 방향과 상관없이 맨 뒤 */
  utilization: col.accessor((s) => (isLiveStatus(s.status) ? s.usage.cpu : undefined), {
    id: 'utilization',
    header: 'Utilization',
    sortFn: 'basic',
    sortUndefined: 'last',
    meta: { label: 'Utilization' },
    cell: ({ row: { original: s } }) => <UtilizationCell server={s} />,
  }),
  monthlyCost: col.accessor('monthlyCost', {
    id: 'monthlyCost',
    header: 'Monthly cost',
    sortFn: 'basic',
    meta: { label: 'Monthly cost', align: 'right' },
    cell: ({ row: { original: s } }) => <Mono>{formatKRW(s.monthlyCost)}</Mono>,
  }),
  uptime: col.accessor('uptimeSec', {
    id: 'uptime',
    header: 'Uptime',
    sortFn: 'basic',
    meta: { label: 'Uptime', align: 'right' },
    cell: ({ row: { original: s } }) => <Mono className="text-ink-soft">{formatUptime(s.uptimeSec)}</Mono>,
  }),
  updated: col.accessor('updatedAt', {
    id: 'updated',
    header: 'Updated',
    sortFn: 'basic',
    meta: { label: 'Updated', align: 'right', cellClassName: 'text-ink-mute' },
    cell: ({ row: { original: s } }) => relativeTime(s.updatedAt),
  }),
} satisfies Record<string, GridColumn<Server>>

export type ServerColumnId = keyof typeof serverColumns

export const pickServerColumns = (ids: ServerColumnId[]): GridColumn<Server>[] => ids.map((id) => serverColumns[id])

/** 같은 열에 화면별 설정(자동 숨김 폭 등)만 덧붙인다. 공유 정의는 그대로 둔다 */
export const withMeta = (
  column: GridColumn<Server>,
  meta: Partial<NonNullable<GridColumn<Server>['meta']>>,
): GridColumn<Server> => ({
  ...column,
  meta: { ...column.meta!, ...meta },
})

/**
 * Servers 목록의 표 열. IP는 호스트명 아래로 합치고, 영역이 좁아지면 Memory(1010px 미만), Location(910px 미만) 순으로
 * 자동으로 숨는다. Location과 Memory는 Overview와 공유하는 정의라 자동 숨김 폭은 여기서만 덧붙인다.
 */
export const serverListColumns: GridColumn<Server>[] = [
  serverColumns.hostnameWithIp,
  serverColumns.status,
  withMeta(serverColumns.location, { hideBelow: 910 }),
  serverColumns.compute,
  withMeta(serverColumns.memory, { hideBelow: 1010 }),
  serverColumns.utilization,
  serverColumns.monthlyCost,
  serverColumns.storage,
  serverColumns.uptime,
  serverColumns.updated,
]

/** Columns 메뉴에서 켜야 보이는 열 */
export const SERVER_LIST_HIDDEN = { storage: false, uptime: false, updated: false }

/**
 * 카드 보기처럼 DataGrid 밖에서 같은 정렬이 필요할 때 쓴다. 열 정의의 accessor와 thenBy를 그대로 따르고,
 * 값이 없는 행은 방향과 상관없이 뒤로 보낸다
 */
export function sortServers(list: Server[], sort: { id: string; desc: boolean }[]): Server[] {
  const active = sort[0]
  const column = active && (serverColumns as Record<string, GridColumn<Server>>)[active.id]
  if (!column) return list
  const value = (c: GridColumn<Server>, s: Server, i: number): unknown =>
    'accessorFn' in c && c.accessorFn
      ? c.accessorFn(s, i)
      : (s as Record<string, unknown>)[(c as { accessorKey: string }).accessorKey]
  const compare = (a: unknown, b: unknown) =>
    typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'en', { numeric: true })
  const thenBy = column.meta?.thenBy ? serverColumns[column.meta.thenBy as ServerColumnId] : undefined

  return list
    .map((s, i) => ({ s, i, v: value(column, s, i), t: thenBy ? value(thenBy, s, i) : undefined }))
    .sort((x, y) => {
      if (x.v === undefined || y.v === undefined) return x.v === y.v ? x.i - y.i : x.v === undefined ? 1 : -1
      const primary = compare(x.v, y.v) * (active.desc ? -1 : 1)
      if (primary) return primary
      return thenBy ? compare(x.t, y.t) : x.i - y.i
    })
    .map((x) => x.s)
}
