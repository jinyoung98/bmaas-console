import type { ColumnVisibilityState, RowSelectionState, SortingState } from '@tanstack/react-table'
import { SearchX } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { ColumnsMenu } from '@/components/data/DataGrid/ColumnsMenu'
import { DataGrid, type DataGridAppearance } from '@/components/data/DataGrid/DataGrid'
import { Pagination } from '@/components/data/DataGrid/Pagination'
import { EmptyState } from '@/components/data/EmptyState'
import { Mono } from '@/components/data/Mono'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ServerActionsMenu } from '@/features/servers/ServerActionsMenu'
import { ServerCard } from '@/features/servers/ServerCard'
import { pickServerColumns, SERVER_LIST_HIDDEN, serverListColumns, sortServers } from '@/features/servers/serverColumns'
import { ServerToolbar } from '@/features/servers/ServerToolbar'
import type { ServerView } from '@/features/servers/useServerQuery'
import type { ServerStatus } from '@/lib/status'
import { filterServers, statusCounts } from '@/mock/selectors'
import { servers } from '@/mock/servers'
import type { RegionId } from '@/mock/types'

const sample = servers.filter((_, i) => i % 8 === 2).slice(0, 5)
const compact = pickServerColumns(['hostname', 'status', 'location', 'cpu', 'memory', 'uptime'])
const id = (s: { id: string }) => s.id

function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <Mono className="block text-xs text-ink-mute">{label}</Mono>
      {children}
    </div>
  )
}

/** 정렬과 선택을 직접 눌러 볼 수 있는 표 하나 */
function Interactive({ appearance, initialSort }: { appearance: DataGridAppearance; initialSort: SortingState }) {
  const [sorting, setSorting] = useState<SortingState>(initialSort)
  const [selection, setSelection] = useState<RowSelectionState>({
    [sample[1].id]: true,
  })
  return (
    <DataGrid
      appearance={appearance}
      data={sample}
      columns={compact}
      getRowId={id}
      sorting={sorting}
      onSortingChange={setSorting}
      rowSelection={selection}
      onRowSelectionChange={setSelection}
      selectionUnit="대"
      bulkActions={() => (
        <>
          <Button size="sm">재부팅</Button>
          <Button size="sm" variant="danger">
            해제
          </Button>
        </>
      )}
      tableClassName="min-w-[720px]"
      scrollClassName={appearance === 'cards' ? '-my-1.5' : undefined}
    />
  )
}

const uncontrolledColumns = pickServerColumns(['hostname', 'status', 'location', 'cpu', 'memory'])

/**
 * 비제어 사용 예. 상태를 들고 있지 않고 초기값만 준다. 정렬, 선택, 페이지, 열 표시는 DataGrid 안에서 관리된다.
 * 위의 리전 전환은 데이터를 줄였을 때의 보정(페이지는 마지막으로, 사라진 행은 선택에서 제외)을 보여주기 위한 것이다.
 */
function Uncontrolled() {
  const [busanOnly, setBusanOnly] = useState<'all' | 'busan'>('all')
  const data = useMemo(
    () => (busanOnly === 'busan' ? servers.filter((s) => s.region === 'kr-busan-1') : servers),
    [busanOnly],
  )
  return (
    <div className="space-y-[8px]">
      <SegmentedControl
        value={busanOnly}
        onValueChange={setBusanOnly}
        options={[
          { value: 'all', label: `전체 ${servers.length}` },
          { value: 'busan', label: 'Busan만' },
        ]}
      />
      <DataGrid
        appearance="ruled"
        data={data}
        columns={uncontrolledColumns}
        getRowId={id}
        defaultSorting={[{ id: 'status', desc: false }]}
        selectable
        selectionUnit="대"
        bulkActions={() => <Button size="sm">재부팅</Button>}
        columnsMenu
        pageSize={5}
        tableClassName="min-w-[720px]"
      />
    </div>
  )
}

/** Components 층: DataGrid의 모양 두 가지와 상태들 */
export function DataGridVariants() {
  return (
    <div className="space-y-8">
      <Variant label='appearance="cards" · 정렬(CPU 내림차순) · 선택 1개'>
        <Interactive appearance="cards" initialSort={[{ id: 'cpu', desc: true }]} />
      </Variant>
      <Variant label='appearance="ruled" · 정렬(Status 심각도 오름차순: Error가 위)'>
        <Interactive appearance="ruled" initialSort={[{ id: 'status', desc: false }]} />
      </Variant>
      <Variant label="비제어: URL 없이 쓰는 예 · defaultSorting, selectable, columnsMenu, pageSize 5">
        <p className="max-w-[640px] text-xs text-ink-mute">
          상태 값을 넘기지 않고 초기값(defaultSorting 등)만 주면 DataGrid가 정렬·선택·페이지·열 표시를 안에서
          관리합니다. 값을 넘기면 제어형이 되어 바깥이 상태를 가집니다. Servers는 이 방식으로 정렬과 페이지를 URL(?sort,
          ?page)에 둡니다.
        </p>
        <Uncontrolled />
      </Variant>
      <Variant label="stickyHeader · 스크롤 영역 높이 제한">
        <DataGrid
          appearance="ruled"
          data={servers.slice(0, 12)}
          columns={compact}
          getRowId={id}
          stickyHeader
          scrollClassName="max-h-[220px]"
          tableClassName="min-w-[720px]"
        />
      </Variant>
      <div className="grid gap-8 xl:grid-cols-2">
        <Variant label="loading">
          <DataGrid
            appearance="ruled"
            data={[]}
            columns={pickServerColumns(['hostname', 'status', 'memory'])}
            getRowId={id}
            loading
            loadingRows={3}
            selectable
          />
        </Variant>
        <Variant label="empty">
          <DataGrid
            data={[]}
            columns={compact}
            getRowId={id}
            empty={
              <EmptyState
                icon={SearchX}
                title="조건에 맞는 서버가 없습니다"
                description="검색어나 상태, 리전 조건을 바꿔 보세요."
                action={<Button>필터 초기화</Button>}
              />
            }
          />
        </Variant>
      </div>
    </div>
  )
}

/** Patterns 층: Servers 목록. 2행 툴바 + DataGrid(cards, compact, ⋯ 메뉴) 또는 카드 그리드. 상태는 URL 대신 이 안에 둔다 */
export function ServersListPattern() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [region, setRegion] = useState<RegionId | null>(null)
  const [gpu, setGpu] = useState(false)
  const [view, setView] = useState<ServerView>('table')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [visibility, setVisibility] = useState<ColumnVisibilityState>(SERVER_LIST_HIDDEN)
  const [page, setPage] = useState(0)

  const base = useMemo(() => filterServers(servers, { q, region }), [q, region])
  const scoped = useMemo(() => filterServers(base, { gpu }), [base, gpu])
  const filtered = useMemo(() => filterServers(scoped, { status }), [scoped, status])
  /** 필터가 바뀌면 1페이지로 */
  const filter = (fn: () => void) => {
    fn()
    setPage(0)
  }
  const reset = () =>
    filter(() => {
      setQ('')
      setStatus(null)
      setRegion(null)
      setGpu(false)
    })
  const noResults = (
    <EmptyState
      icon={SearchX}
      title="조건에 맞는 서버가 없습니다"
      description="검색어나 상태, 리전 조건을 바꿔 보세요."
      action={<Button onClick={reset}>필터 초기화</Button>}
    />
  )
  const cards = sortServers(filtered, sorting)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-[12px]">
      <ServerToolbar
        q={q}
        status={status}
        region={region}
        gpu={gpu}
        view={view}
        counts={statusCounts(scoped)}
        gpuCount={base.filter((s) => s.gpu).length}
        onSearch={(v) => filter(() => setQ(v))}
        onStatus={(v) => filter(() => setStatus(v))}
        onRegion={(v) => filter(() => setRegion(v))}
        onGpu={(v) => filter(() => setGpu(v))}
        onView={(v) => filter(() => setView(v))}
        extra={
          view === 'table' && <ColumnsMenu columns={serverListColumns} value={visibility} onChange={setVisibility} />
        }
      />
      {view === 'grid' ? (
        cards.length === 0 ? (
          noResults
        ) : (
          <div className="@container">
            <ul className="grid grid-cols-1 gap-[16px] @[640px]:grid-cols-2 @[960px]:grid-cols-3">
              {cards.slice(page * 6, page * 6 + 6).map((s) => (
                <li key={s.id} className="flex">
                  <ServerCard server={s} className="flex-1" />
                </li>
              ))}
            </ul>
            <Pagination
              className="mt-[16px]"
              pageIndex={page}
              pageSize={6}
              total={cards.length}
              onPageChange={setPage}
            />
          </div>
        )
      ) : (
        <DataGrid
          data={filtered}
          columns={serverListColumns}
          getRowId={id}
          rowActions={(s) => <ServerActionsMenu server={s} />}
          compact
          sorting={sorting}
          onSortingChange={(next) => filter(() => setSorting(next))}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          selectionUnit="대"
          bulkActions={() => (
            <>
              <Button size="sm">재부팅</Button>
              <Button size="sm">전원 끄기</Button>
              <Button size="sm" variant="danger">
                서버 해제
              </Button>
            </>
          )}
          columnVisibility={visibility}
          pageSize={5}
          pageIndex={page}
          onPageIndexChange={setPage}
          scrollClassName="-my-1.5"
          empty={noResults}
        />
      )}
    </div>
  )
}
