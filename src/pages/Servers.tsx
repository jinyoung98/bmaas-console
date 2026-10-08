import type { ColumnVisibilityState, RowSelectionState } from '@tanstack/react-table'
import { Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ColumnsMenu } from '@/components/data/DataGrid/ColumnsMenu'
import { DataGrid } from '@/components/data/DataGrid/DataGrid'
import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { ServerBrickMap } from '@/features/servers/ServerBrickMap'
import { pickServerColumns } from '@/features/servers/serverColumns'
import { ServerToolbar } from '@/features/servers/ServerToolbar'
import { useServerQuery } from '@/features/servers/useServerQuery'
import { filterServers, groupByRegion, statusCounts } from '@/mock/selectors'
import { servers } from '@/mock/servers'

const PAGE_SIZE = 10
const groups = groupByRegion(servers)
const columns = pickServerColumns(['hostname', 'status', 'location', 'cpu', 'memory', 'storage', 'ip', 'uptime', 'updated'])

export default function Servers() {
  const { q, status, region, view, page, selected, sort, update, reset } = useServerQuery()
  const [visibility, setVisibility] = useState<ColumnVisibilityState>({ updated: false })
  const [selection, setSelection] = useState<RowSelectionState>({})

  // 칩의 개수는 상태 필터를 빼고 검색과 리전만 적용한 결과로 센다. 칩을 눌렀을 때 몇 대가 나올지 미리 보인다
  const scoped = useMemo(() => filterServers(servers, { q, region }), [q, region])
  const counts = useMemo(() => statusCounts(scoped), [scoped])
  const filtered = useMemo(() => filterServers(scoped, { status }), [scoped, status])

  const visible = useMemo(() => new Set(filtered.map((s) => s.id)), [filtered])
  const picked = filtered.find((s) => s.id === selected) ?? null
  // 필터에서 빠진 서버는 선택에서도 뺀다. 보이지 않는 서버에 일괄 작업이 걸리지 않게 한다
  const rowSelection = useMemo(
    () => Object.fromEntries(Object.keys(selection).filter((id) => visible.has(id)).map((id) => [id, true] as const)),
    [selection, visible],
  )

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

      <div className="grid grid-cols-[minmax(0,1fr)] gap-[12px] px-5 py-7 md:px-8">
        <ServerToolbar
          q={q}
          status={status}
          region={region}
          view={view}
          counts={counts}
          onSearch={(v) => update({ q: v }, { replace: true })}
          onStatus={(v) => update({ status: v })}
          onRegion={(v) => update({ region: v })}
          onView={(v) => update({ view: v })}
          extra={view === 'table' && <ColumnsMenu columns={columns} value={visibility} onChange={setVisibility} />}
        />

        {view === 'table' ? (
          <DataGrid
            data={filtered}
            columns={columns}
            getRowId={(s) => s.id}
            getRowHref={(s) => `/servers/${s.id}`}
            sorting={sort}
            onSortingChange={(next) => update({ sort: next })}
            rowSelection={rowSelection}
            onRowSelectionChange={setSelection}
            selectionUnit="대"
            bulkActions={() => (
              <>
                <Button size="sm" onClick={() => setSelection({})}>
                  재부팅
                </Button>
                <Button size="sm" onClick={() => setSelection({})}>
                  점검 모드
                </Button>
                <Button size="sm" variant="danger" onClick={() => setSelection({})}>
                  해제
                </Button>
              </>
            )}
            columnVisibility={visibility}
            pageSize={PAGE_SIZE}
            pageIndex={page - 1}
            onPageIndexChange={(p) => update({ page: p + 1 })}
            // 행 카드의 위아래 간격(border-spacing)만큼 당겨 첫 줄을 툴바에 붙인다
            scrollClassName="-my-1.5"
            tableClassName="min-w-[1040px]"
            empty={noResults}
          />
        ) : filtered.length === 0 ? (
          noResults
        ) : (
          <ServerBrickMap
            groups={groups}
            visible={visible}
            selected={picked}
            onSelect={(id) => update({ selected: id }, { replace: true })}
          />
        )}
      </div>
    </>
  )
}
