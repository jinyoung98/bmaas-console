import { Link } from 'react-router'
import { createGridColumns } from '@/components/data/DataGrid/columns'
import { Mono } from '@/components/data/Mono'
import { StatusIcon } from '@/components/data/StatusIcon'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { regionById } from '@/mock/regions'
import { servers } from '@/mock/servers'
import type { ActivityEvent } from '@/mock/types'

const sub = 'num block text-[11px] leading-4 text-ink-mute'
const col = createGridColumns<ActivityEvent>()
const pad = (n: number) => String(n).padStart(2, '0')

const regionOf = new Map(servers.map((s) => [s.hostname, s.region]))
const isToday = (at: number) => new Date(at).toDateString() === new Date().toDateString()

/** 날짜 그룹이 없을 때 쓰는 시각. 오늘은 시각만, 그보다 오래된 이벤트는 날짜를 붙인다 */
function formatWhen(at: number) {
  const d = new Date(at)
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return isToday(at) ? hm : `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${hm}`
}

const hourMinute = (at: number) => `${pad(new Date(at).getHours())}:${pad(new Date(at).getMinutes())}`

/** 날짜가 그룹 머리글에 있으면(grouped) 시각만, 없으면 날짜까지 쓴다 */
const timeColumn = (grouped: boolean) =>
  col.accessor('at', {
    id: 'time',
    header: 'Time',
    sortFn: 'basic',
    meta: { label: 'Time' },
    cell: ({ row: { original: e } }) => (
      <>
        <Mono className="text-xs text-ink-soft">{grouped ? hourMinute(e.at) : formatWhen(e.at)}</Mono>
        <span className={sub}>{relativeTime(e.at)}</span>
      </>
    ),
  })

/**
 * Activity 목록의 열. 읽는 순서대로 Event → Server → Time → Actor.
 * 심각도는 Event 앞 아이콘이 말하고(Warning·Error는 글자도 진하게), 심각도 필터는 툴바 칩이 맡는다.
 * Actor는 가장 먼저 숨고(좁은 폭), 시스템과 브릭섬 운영팀의 이벤트는 흐리게 써서 사용자의 조작이 먼저 보이게 한다.
 */
export const activityColumns = {
  event: col.accessor('text', {
    id: 'event',
    header: 'Event',
    enableSorting: false,
    meta: { label: 'Event', required: true },
    cell: ({ row: { original: e } }) => (
      <span className="flex items-center gap-[10px]">
        <StatusIcon status={e.severity} />
        <span className={cn('whitespace-normal', (e.severity === 'warning' || e.severity === 'error') && 'font-medium')}>
          {e.text}
        </span>
      </span>
    ),
  }),
  server: col.accessor('hostname', {
    id: 'server',
    header: 'Server',
    sortFn: 'alphanumeric',
    meta: { label: 'Server' },
    cell: ({ row: { original: e } }) => {
      const region = regionOf.get(e.hostname)
      return (
        <>
          <Link to={`/servers/${e.hostname}`} onClick={(ev) => ev.stopPropagation()}>
            <Mono className="font-medium">{e.hostname}</Mono>
          </Link>
          {region && <span className={sub}>{regionById[region].city}</span>}
        </>
      )
    },
  }),
  time: timeColumn(false),
  groupedTime: timeColumn(true),
  actor: col.accessor((e) => e.actor.name, {
    id: 'actor',
    header: 'Actor',
    enableSorting: false,
    meta: { label: 'Actor', hideBelow: 900 },
    cell: ({ row: { original: e } }) => (
      <span className={cn('text-sm', e.actor.kind === 'user' ? 'text-ink-soft' : 'text-ink-mute')}>{e.actor.name}</span>
    ),
  }),
}

export const activityListColumns = [
  activityColumns.event,
  activityColumns.server,
  activityColumns.time,
  activityColumns.actor,
]

/** 시간순 정렬일 때. 날짜는 그룹 머리글이 말하므로 Time은 시각만 쓴다 */
export const activityGroupedColumns = [
  activityColumns.event,
  activityColumns.server,
  activityColumns.groupedTime,
  activityColumns.actor,
]

const dayKey = (e: ActivityEvent) => new Date(e.at).toDateString()
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

/** Today / Yesterday / 10월 6일 (월). 건수는 그 날 이벤트 전체 */
export const activityGroupBy = {
  key: dayKey,
  label: (e: ActivityEvent, count: number) => {
    const d = new Date(e.at)
    const diff = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(e.at).setHours(0, 0, 0, 0)) / 86_400_000)
    const name = diff === 0 ? '오늘' : diff === 1 ? '어제' : `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`
    return (
      <span className="flex items-baseline gap-[8px]">
        {name}
        <span className="num text-ink-mute">{count}</span>
      </span>
    )
  },
}
