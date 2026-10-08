import type { ColumnVisibilityState, RowSelectionState } from '@tanstack/react-table'
import { Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ColumnsMenu } from '@/components/data/DataGrid/ColumnsMenu'
import { DataGrid } from '@/components/data/DataGrid/DataGrid'
import { Pagination } from '@/components/data/DataGrid/Pagination'
import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { useElementWidth } from '@/lib/useElementWidth'
import { ServerActionsMenu } from '@/features/servers/ServerActionsMenu'
import { ServerCard } from '@/features/servers/ServerCard'
import { SERVER_LIST_HIDDEN, serverListColumns, sortServers } from '@/features/servers/serverColumns'
import { ServerToolbar } from '@/features/servers/ServerToolbar'
import { useServerQuery, type ServerView } from '@/features/servers/useServerQuery'
import { filterServers, statusCounts } from '@/mock/selectors'
import { servers } from '@/mock/servers'

const TABLE_PAGE_SIZE = 10
const GRID_PAGE_SIZE = 12
/** 이보다 좁은 영역에서는 표 대신 카드로 시작한다(?view가 없을 때만) */
const GRID_BELOW = 830

const columns = serverListColumns

const BULK = [
  { label: '재부팅', request: '재부팅을' },
  { label: '전원 끄기', request: '전원 끄기를' },
] as const

export default function Servers() {
  const { q, status, region, gpu, view, page, sort, update, reset } = useServerQuery()
  const [visibility, setVisibility] = useState<ColumnVisibilityState>(SERVER_LIST_HIDDEN)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [measure, width] = useElementWidth()

  // 사용자가 고른 보기가 없으면 영역 폭으로 정한다. 폭을 재기 전(첫 페인트 전 한 번)에는 목록을 그리지 않는다
  const current: ServerView | null = view ?? (width === null ? null : width < GRID_BELOW ? 'grid' : 'table')

  // 칩의 개수는 상태 필터만 빼고 센다. 칩을 눌렀을 때 몇 대가 나올지 미리 보인다
  const base = useMemo(() => filterServers(servers, { q, region }), [q, region])
  const scoped = useMemo(() => filterServers(base, { gpu }), [base, gpu])
  const counts = useMemo(() => statusCounts(scoped), [scoped])
  const gpuCount = useMemo(() => base.filter((s) => s.gpu).length, [base])
  const filtered = useMemo(() => filterServers(scoped, { status }), [scoped, status])

  // 필터에서 빠진 서버는 선택에서도 뺀다. 보이지 않는 서버에 일괄 작업이 걸리지 않게 한다
  const visibleIds = useMemo(() => new Set(filtered.map((s) => s.id)), [filtered])
  const rowSelection = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(selection)
          .filter((id) => visibleIds.has(id))
          .map((id) => [id, true] as const),
      ),
    [selection, visibleIds],
  )

  // 카드 보기도 표와 같은 정렬(?sort)을 따른다
  const cards = useMemo(() => sortServers(filtered, sort), [filtered, sort])
  const cardPages = Math.max(1, Math.ceil(cards.length / GRID_PAGE_SIZE))
  const cardPage = Math.min(page, cardPages) - 1

  const request = (what: string, ids: string[]) => {
    toast(`${ids.length}대 ${what} 요청했습니다`)
    setSelection({})
  }

  const noResults = (
    <EmptyState
      icon={SearchX}
      title="조건에 맞는 서버가 없습니다"
      description="검색어나 상태, 리전 조건을 바꿔 보세요."
      action={<Button onClick={reset}>필터 초기화</Button>}
    />
  )

  return (
    <>
      <PageHeader
        title="Servers"
        description="베어메탈 서버를 관리합니다."
        actions={
          <Button variant="primary">
            <Plus /> Create server
          </Button>
        }
      />

      <div className="px-5 py-7 md:px-8">
        {/* 보기를 정하는 폭은 여백을 뺀 본문 폭이다(표가 놓이는 영역과 같다) */}
        <div ref={measure} className="grid grid-cols-[minmax(0,1fr)] gap-[12px]">
          <ServerToolbar
            q={q}
            status={status}
            region={region}
            gpu={gpu}
            view={current ?? 'table'}
            counts={counts}
            gpuCount={gpuCount}
            onSearch={(v) => update({ q: v }, { replace: true })}
            onStatus={(v) => update({ status: v })}
            onRegion={(v) => update({ region: v })}
            onGpu={(v) => update({ gpu: v })}
            onView={(v) => update({ view: v })}
            extra={current === 'table' && <ColumnsMenu columns={columns} value={visibility} onChange={setVisibility} />}
          />

          {current === 'table' && (
            <DataGrid
              data={filtered}
              columns={columns}
              getRowId={(s) => s.id}
              getRowHref={(s) => `/servers/${s.id}`}
              rowActions={(s) => <ServerActionsMenu server={s} />}
              compact
              sorting={sort}
              onSortingChange={(next) => update({ sort: next })}
              rowSelection={rowSelection}
              onRowSelectionChange={setSelection}
              selectionUnit="대"
              bulkActions={(ids) => (
                <>
                  {BULK.map((a) => (
                    <Button key={a.label} size="sm" onClick={() => request(a.request, ids)}>
                      {a.label}
                    </Button>
                  ))}
                  <Button size="sm" variant="danger" onClick={() => request('서버 해제를', ids)}>
                    서버 해제
                  </Button>
                </>
              )}
              columnVisibility={visibility}
              pageSize={TABLE_PAGE_SIZE}
              pageIndex={page - 1}
              onPageIndexChange={(p) => update({ page: p + 1 })}
              // 행 카드의 위아래 간격(border-spacing)만큼 당겨 첫 줄을 툴바에 붙인다
              scrollClassName="-my-1.5"
              empty={noResults}
            />
          )}

          {current === 'grid' &&
            (cards.length === 0 ? (
              noResults
            ) : (
              <div className="@container">
                <ul className="grid grid-cols-1 gap-[16px] @[640px]:grid-cols-2 @[960px]:grid-cols-3">
                  {cards.slice(cardPage * GRID_PAGE_SIZE, (cardPage + 1) * GRID_PAGE_SIZE).map((s) => (
                    <li key={s.id} className="flex">
                      <ServerCard server={s} className="flex-1" />
                    </li>
                  ))}
                </ul>
                <Pagination
                  className="mt-[16px]"
                  pageIndex={cardPage}
                  pageSize={GRID_PAGE_SIZE}
                  total={cards.length}
                  onPageChange={(p) => update({ page: p + 1 })}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
