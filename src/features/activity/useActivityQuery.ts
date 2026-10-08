import type { SortingState } from '@tanstack/react-table'
import { useNavigate, useSearchParams } from 'react-router'
import { STATUS_ORDER, type ServerStatus } from '@/lib/status'
import type { ActivityRange } from '@/mock/selectors'
import { servers } from '@/mock/servers'

type Patch = Partial<{
  q: string
  severity: ServerStatus | null
  server: string | null
  range: ActivityRange
  page: number
  sort: SortingState
  event: string | null
}>

const RANGES: ActivityRange[] = ['24h', '7d', '30d']
const DEFAULT_RANGE: ActivityRange = '7d'
/** 정렬이 없으면 최신순. 이 상태는 쿼리에 적지 않는다 */
const DEFAULT_SORT: SortingState = [{ id: 'time', desc: true }]
const SORTABLE = ['time', 'server']

const isSeverity = (v: string | null): v is ServerStatus => STATUS_ORDER.includes(v as ServerStatus)
const isServer = (v: string | null): v is string => servers.some((s) => s.hostname === v)

/** ?sort=server:asc ↔ [{ id: 'server', desc: false }]. 한 번에 한 열만 정렬한다 */
function parseSort(v: string | null): SortingState {
  const [id, dir] = (v ?? '').split(':')
  return SORTABLE.includes(id) && (dir === 'asc' || dir === 'desc') ? [{ id, desc: dir === 'desc' }] : DEFAULT_SORT
}
const isDefaultSort = (s: SortingState) => s.length === 0 || (s[0].id === 'time' && s[0].desc)
const formatSort = (s: SortingState) => (isDefaultSort(s) ? null : `${s[0].id}:${s[0].desc ? 'desc' : 'asc'}`)

/**
 * Activity 목록의 상태(검색, 심각도, 서버, 기간, 정렬, 페이지)를 URL 쿼리에 둔다.
 * 서버 상세의 "View all"(/activity?server=...)로 들어와도 같은 화면이 나온다. 기본값은 쿼리에 적지 않는다.
 */
export function useActivityQuery() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const raw = { severity: params.get('severity'), server: params.get('server'), range: params.get('range') }
  const state = {
    q: params.get('q') ?? '',
    severity: isSeverity(raw.severity) ? raw.severity : null,
    server: isServer(raw.server) ? raw.server : null,
    range: (RANGES.includes(raw.range as ActivityRange) ? raw.range : DEFAULT_RANGE) as ActivityRange,
    page: Math.max(1, Number(params.get('page')) || 1),
    sort: parseSort(params.get('sort')),
    /** 드로어로 열린 이벤트. 있는지는 화면이 확인한다 */
    event: params.get('event'),
  }

  /** 필터와 정렬이 바뀌면 1페이지로 돌아간다. 검색 입력은 글자마다 히스토리를 쌓지 않는다 */
  function update(patch: Patch, { replace = false } = {}) {
    const next = new URLSearchParams(params)
    const set = (key: string, value: string | null | undefined) => {
      if (value) next.set(key, value)
      else next.delete(key)
    }

    if ('q' in patch) set('q', patch.q)
    if ('severity' in patch) set('severity', patch.severity)
    if ('server' in patch) set('server', patch.server)
    if ('range' in patch) set('range', patch.range === DEFAULT_RANGE ? null : patch.range)
    if ('event' in patch) set('event', patch.event)
    if ('sort' in patch) set('sort', formatSort(patch.sort ?? []))
    if ('page' in patch) set('page', patch.page && patch.page > 1 ? String(patch.page) : null)
    else if (['q', 'severity', 'server', 'range', 'sort'].some((k) => k in patch)) next.delete('page')

    const search = next.toString().replaceAll('%3A', ':')
    navigate({ search: search ? `?${search}` : '' }, { replace })
  }

  const reset = () => update({ q: '', severity: null, server: null })

  return { ...state, update, reset }
}
