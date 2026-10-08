import type { SortingState } from '@tanstack/react-table'
import { useNavigate, useSearchParams } from 'react-router'
import { STATUS_ORDER, type ServerStatus } from '@/lib/status'
import { regions } from '@/mock/regions'
import type { RegionId } from '@/mock/types'
import { serverColumns } from './serverColumns'

export type ServerView = 'table' | 'grid'

type Patch = Partial<{
  q: string
  status: ServerStatus | null
  region: RegionId | null
  gpu: boolean
  view: ServerView
  page: number
  sort: SortingState
}>

const isStatus = (v: string | null): v is ServerStatus => STATUS_ORDER.includes(v as ServerStatus)
const isRegion = (v: string | null): v is RegionId => regions.some((r) => r.id === v)

/** ?sort=cpu:desc ↔ [{ id: 'cpu', desc: true }]. 한 번에 한 열만 정렬한다 */
function parseSort(v: string | null): SortingState {
  const [id, dir] = (v ?? '').split(':')
  return Object.hasOwn(serverColumns, id) && (dir === 'asc' || dir === 'desc') ? [{ id, desc: dir === 'desc' }] : []
}
const formatSort = (s: SortingState) => (s[0] ? `${s[0].id}:${s[0].desc ? 'desc' : 'asc'}` : null)

/**
 * 목록 화면의 상태(검색, 필터, 정렬, 보기, 페이지)를 URL 쿼리에 둔다.
 * 새로고침, 뒤로가기, 링크 공유(Overview의 Fleet 칩 → ?status=error)에서 같은 화면이 나온다.
 * 기본값은 쿼리에 적지 않는다. 단 보기(view)는 사용자가 고른 경우에만 적고, 없으면 화면 폭으로 정한다(null).
 */
export function useServerQuery() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const raw = { status: params.get('status'), region: params.get('region'), view: params.get('view') }
  const state = {
    q: params.get('q') ?? '',
    status: isStatus(raw.status) ? raw.status : null,
    region: isRegion(raw.region) ? raw.region : null,
    gpu: params.get('gpu') === '1',
    view: raw.view === 'grid' || raw.view === 'table' ? (raw.view as ServerView) : null,
    page: Math.max(1, Number(params.get('page')) || 1),
    sort: parseSort(params.get('sort')),
  }

  /** 필터(q, status, region, gpu), 정렬, 보기가 바뀌면 1페이지로 돌아간다. 검색 입력은 글자마다 히스토리를 쌓지 않는다 */
  function update(patch: Patch, { replace = false } = {}) {
    const next = new URLSearchParams(params)
    const set = (key: string, value: string | null | undefined) => {
      if (value) next.set(key, value)
      else next.delete(key)
    }

    if ('q' in patch) set('q', patch.q)
    if ('status' in patch) set('status', patch.status)
    if ('region' in patch) set('region', patch.region)
    if ('gpu' in patch) set('gpu', patch.gpu ? '1' : null)
    if ('view' in patch) set('view', patch.view)
    if ('sort' in patch) set('sort', formatSort(patch.sort ?? []))
    if ('page' in patch) set('page', patch.page && patch.page > 1 ? String(patch.page) : null)
    else if (['q', 'status', 'region', 'gpu', 'sort', 'view'].some((k) => k in patch)) next.delete('page')

    // ':'는 쿼리에 그대로 써도 되는 글자라 ?sort=cpu:desc 로 읽히게 둔다(URLSearchParams는 %3A로 바꾼다)
    const search = next.toString().replaceAll('%3A', ':')
    navigate({ search: search ? `?${search}` : '' }, { replace })
  }

  const reset = () => update({ q: '', status: null, region: null, gpu: false })

  return { ...state, update, reset }
}
