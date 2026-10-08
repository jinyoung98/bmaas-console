import { createGridColumns, type GridColumn } from '@/components/data/DataGrid/columns'
import { Mono, Value } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { formatUptime, relativeTime } from '@/lib/format'
import { STATUS_RANK } from '@/lib/status'
import { regionById } from '@/mock/regions'
import type { Server } from '@/mock/types'
import { HostCell } from './HostCell'

const sub = 'num block text-[11px] leading-4 text-ink-mute'
const col = createGridColumns<Server>()

/** 10.20.1.11 → 010020001011. 문자열 비교로도 IP 순서가 맞게 옥텟을 세 자리로 채운다 */
const ipKey = (ip: string) => ip.split('.').map((o) => o.padStart(3, '0')).join('')

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
