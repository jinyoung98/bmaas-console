import {
  functionalUpdate,
  useTable,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { Fragment, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Value } from '@/components/data/Mono'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useElementWidth } from '@/lib/useElementWidth'
import { ColumnsMenu } from './ColumnsMenu'
import { gridFeatures, type GridColumn, type GridFeatures } from './columns'
import { Pagination } from './Pagination'
import { useControllableState } from './useControllableState'

export type DataGridAppearance = 'cards' | 'ruled'

type Props<T extends RowData> = {
  data: T[]
  columns: GridColumn<T>[]
  getRowId: (row: T) => string
  /** cards: 행마다 선 박스(Overview Recent servers). ruled: 구분선 한 장짜리 패널 */
  appearance?: DataGridAppearance

  /*
   * 상태(정렬, 선택, 열 표시, 페이지)는 모두 같은 규칙을 따른다.
   * - 제어형: 값(sorting 등)을 넘기면 그 값을 그대로 쓰고, 바뀔 때 onXxxChange만 부른다. URL에 두려면 이쪽(Servers).
   * - 비제어형: 값을 넘기지 않으면 defaultXxx로 시작하는 내부 상태를 쓰고, 바뀔 때 onXxxChange로 알려준다.
   */

  /** 헤더를 눌러 정렬한다. 한 번에 한 열, 기본 → 오름 → 내림 → 기본. 생략하면 정렬 관련 prop이 하나라도 있을 때 켜진다 */
  sortable?: boolean
  sorting?: SortingState
  defaultSorting?: SortingState
  onSortingChange?: (next: SortingState) => void

  /** 맨 앞에 체크박스 열을 붙인다. 생략하면 선택 관련 prop이 하나라도 있을 때 켜진다 */
  selectable?: boolean
  rowSelection?: RowSelectionState
  defaultRowSelection?: RowSelectionState
  onRowSelectionChange?: (next: RowSelectionState) => void
  /** 선택이 하나라도 있으면 표 위에 일괄 작업 바를 띄운다 */
  bulkActions?: (selectedIds: string[]) => ReactNode
  /** 일괄 작업 바의 "N대 선택됨"에서 숫자 뒤의 말 */
  selectionUnit?: string

  columnVisibility?: ColumnVisibilityState
  defaultColumnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: (next: ColumnVisibilityState) => void
  /** 표 위 오른쪽에 Columns 메뉴를 붙인다. 툴바가 따로 있으면 끄고 ColumnsMenu를 직접 놓는다(Servers) */
  columnsMenu?: boolean

  /** 넘기면 아래에 Pagination을 붙이고 이 크기로 자른다. 정렬은 자르기 전에 적용된다 */
  pageSize?: number
  /** 0부터 시작. 데이터가 줄어 범위를 넘으면 마지막 페이지를 보여준다 */
  pageIndex?: number
  defaultPageIndex?: number
  onPageIndexChange?: (next: number) => void

  /** 넘기면 행 전체가 링크가 되고 끝에 화살표 열이 붙는다 */
  getRowHref?: (row: T) => string
  /** 넘기면 행을 눌러(또는 Enter) 이 함수를 부른다. 상세를 드로어로 여는 화면용이고, 링크 열은 붙지 않는다 */
  onRowClick?: (row: T) => void
  /** onRowClick과 함께: 이 id의 행을 눌린 행으로 표시한다(열려 있는 드로어의 행) */
  activeRowId?: string | null
  /** 넘기면 마지막 열에 화살표 대신 이 내용(⋯ 메뉴 등)을 놓는다. 이 칸의 클릭은 행 클릭으로 번지지 않는다 */
  rowActions?: (row: T) => ReactNode
  /**
   * 연속한 행을 key가 같은 것끼리 묶어 사이사이에 구분 행을 끼운다(Activity의 날짜 그룹). 정렬이 그 key 순서일 때만 넘긴다.
   * 페이지 경계에서 그룹이 이어지면 다음 페이지 맨 위에 구분 행을 다시 그린다. count는 자르기 전 전체 데이터 기준이다
   */
  groupBy?: { key: (row: T) => string; label: (row: T, count: number) => ReactNode }
  /** 셀 좌우 여백을 12px로 줄인다. 열이 많은 목록 화면용 */
  compact?: boolean

  loading?: boolean
  loadingRows?: number
  /** 0건일 때 표 대신 보여줄 내용 */
  empty?: ReactNode

  /** 헤더를 스크롤 영역 위쪽에 붙인다. scrollClassName으로 높이를 제한할 때 의미가 있다 */
  stickyHeader?: boolean
  className?: string
  /** 가로(와 세로) 스크롤 영역 */
  scrollClassName?: string
  tableClassName?: string
}

const STYLE = {
  cards: {
    scroll: 'overflow-x-auto',
    table: 'w-full border-separate border-spacing-y-1.5 text-sm',
    th: 'h-8 px-4 text-left text-xs font-medium text-ink-mute',
    // 헤더와 첫 행 사이 간격(border-spacing)으로 아래 행이 비치지 않게 같은 높이의 바탕을 헤더 밑에 덧댄다
    sticky:
      "sticky top-0 z-[1] bg-bg after:absolute after:inset-x-0 after:top-full after:h-1.5 after:bg-bg after:content-['']",
    tr: '',
    // 행 카드: 셀마다 위아래 테두리, 양 끝 셀만 좌우 테두리와 라운드를 줘서 한 장의 박스처럼 보이게 한다
    td:
      'h-13 whitespace-nowrap border-y border-line bg-raised px-4 align-middle transition-colors ' +
      'first:rounded-l-sm first:border-l last:rounded-r-sm last:border-r ' +
      'group-hover:border-line-strong group-hover:bg-accent-subtle',
    selected: 'border-line-strong bg-accent-subtle',
  },
  ruled: {
    scroll: 'overflow-auto rounded-lg border bg-surface',
    table: 'w-full border-collapse text-sm',
    th: 'h-[34px] bg-sunken px-4 text-left text-xs font-medium text-ink-mute',
    // border-collapse의 테두리는 sticky를 따라오지 않으므로 헤더 아래 선을 따로 그린다
    sticky: "sticky top-0 z-[1] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line after:content-['']",
    tr: 'transition-colors hover:bg-accent-subtle',
    td: 'h-[44px] whitespace-nowrap border-t px-4 align-middle',
    selected: 'bg-accent-subtle',
  },
} as const

/**
 * 일반화된 데이터 표. 정렬, 선택, 열 표시, 페이지 자르기는 TanStack Table(v9, headless)이 상태로 다루고
 * 마크업과 모양은 여기서 토큰으로 그린다. 상태는 제어형(바깥에서 받음, URL 연동)과 비제어형(내부 상태) 모두 된다.
 */
export function DataGrid<T extends RowData>({
  data,
  columns,
  getRowId,
  appearance = 'cards',
  sortable,
  sorting: sortingProp,
  defaultSorting = [],
  onSortingChange,
  selectable: selectableProp,
  rowSelection: rowSelectionProp,
  defaultRowSelection = {},
  onRowSelectionChange,
  bulkActions,
  selectionUnit = '개',
  columnVisibility: visibilityProp,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  columnsMenu = false,
  pageSize,
  pageIndex: pageIndexProp,
  defaultPageIndex = 0,
  onPageIndexChange,
  getRowHref,
  onRowClick,
  activeRowId,
  rowActions,
  groupBy,
  compact = false,
  loading = false,
  loadingRows = 5,
  empty,
  stickyHeader = false,
  className,
  scrollClassName,
  tableClassName,
}: Props<T>) {
  const navigate = useNavigate()
  const s = STYLE[appearance]
  const canSort = sortable ?? (sortingProp !== undefined || onSortingChange !== undefined || defaultSorting.length > 0)
  const selectable =
    selectableProp ??
    (rowSelectionProp !== undefined || onRowSelectionChange !== undefined || Object.keys(defaultRowSelection).length > 0)

  const [sorting, setSorting] = useControllableState(sortingProp, defaultSorting, onSortingChange)
  const [rawSelection, setSelection] = useControllableState(rowSelectionProp, defaultRowSelection, onRowSelectionChange)
  const [columnVisibility, setColumnVisibility] = useControllableState(
    visibilityProp,
    defaultColumnVisibility,
    onColumnVisibilityChange,
  )
  const [pageIndex, setPageIndex] = useControllableState(pageIndexProp, defaultPageIndex, onPageIndexChange)

  // 데이터가 바뀌어(필터 등) 없어진 행은 선택에서 뺀다. 보이지 않는 행에 일괄 작업이 걸리지 않게 한다
  const ids = useMemo(() => new Set(data.map(getRowId)), [data, getRowId])
  const rowSelection = useMemo(() => {
    const kept = Object.keys(rawSelection).filter((id) => ids.has(id))
    return kept.length === Object.keys(rawSelection).length
      ? rawSelection
      : (Object.fromEntries(kept.map((id) => [id, true])) as RowSelectionState)
  }, [rawSelection, ids])

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>()
    if (groupBy) for (const row of data) counts.set(groupBy.key(row), (counts.get(groupBy.key(row)) ?? 0) + 1)
    return counts
  }, [data, groupBy])

  const size = pageSize ?? Math.max(1, data.length)
  const pageCount = Math.max(1, Math.ceil(data.length / size))
  const page = Math.min(Math.max(0, pageIndex), pageCount - 1)

  // 비제어 선택도 정리한 결과를 상태에 남긴다. 데이터가 다시 늘어도 사라졌던 행이 선택된 채로 돌아오지 않게 한다
  useEffect(() => {
    if (rowSelectionProp === undefined && rowSelection !== rawSelection) setSelection(rowSelection)
  }, [rowSelectionProp, rowSelection, rawSelection, setSelection])

  // 비제어 페이지가 데이터보다 뒤에 있으면(필터로 줄어든 경우) 마지막 페이지로 상태를 맞춘다.
  // 제어형은 위에서 보여줄 때만 맞추고 값은 바깥이 정한다
  useEffect(() => {
    if (pageIndexProp === undefined && pageSize !== undefined && pageIndex !== page) setPageIndex(page)
  }, [pageIndexProp, pageSize, pageIndex, page, setPageIndex])

  // 열 meta.hideBelow(px)보다 표가 놓인 영역이 좁으면 그 열을 잠시 숨긴다. 뷰포트가 아니라 이 영역 폭 기준이다.
  // 사용자가 Columns 메뉴로 정한 상태는 건드리지 않고, 엔진에 넘길 때만 합친다. hideBelow가 없으면 재지 않는다
  const responsive = columns.some((c) => c.meta?.hideBelow !== undefined)
  const [measure, width] = useElementWidth(responsive)
  const engineVisibility = useMemo(() => {
    if (!responsive || width === null) return columnVisibility
    const squeezed = columns.filter((c) => c.id && (c.meta?.hideBelow ?? 0) > width).map((c) => [c.id!, false] as const)
    return squeezed.length ? { ...columnVisibility, ...Object.fromEntries(squeezed) } : columnVisibility
  }, [responsive, width, columns, columnVisibility])

  // 화면에 보이는 정렬은 한 열이지만, 그 열에 thenBy가 있으면 보조 정렬을 뒤에 붙여 엔진에 넘긴다.
  // 엔진은 같은 값끼리 원래 순서를 지키는데 이건 내림차순에서도 뒤집히지 않으므로, 보조 정렬은 항상 오름차순이 된다
  const active = sorting[0]
  const thenBy = active && columns.find((c) => c.id === active.id)?.meta?.thenBy
  const engineSorting = active && thenBy && thenBy !== active.id ? [active, { id: thenBy, desc: false }] : sorting

  const table = useTable<GridFeatures, T>({
    features: gridFeatures,
    columns,
    data,
    getRowId: (row) => getRowId(row),
    state: {
      sorting: engineSorting,
      rowSelection,
      columnVisibility: engineVisibility,
      pagination: { pageIndex: page, pageSize: size },
    },
    enableSorting: canSort,
    enableMultiSort: false,
    enableRowSelection: selectable,
    autoResetPageIndex: false,
    onRowSelectionChange: (u) => setSelection(functionalUpdate(u, rowSelection)),
  })

  if (!loading && data.length === 0 && empty) return <>{empty}</>

  const selectedIds = Object.keys(rowSelection)
  const headers = table.getHeaderGroups()[0]?.headers ?? []
  const rows = table.getRowModel().rows
  const pad = compact ? 'px-[12px]' : undefined
  const th = (extra?: string) => cn(s.th, pad, stickyHeader && s.sticky, extra)
  const td = (...extra: (string | false | undefined)[]) => cn(s.td, pad, ...extra)
  const trailing = Boolean(getRowHref || rowActions)

  function toggleSort(id: string, dir: false | 'asc' | 'desc') {
    setSorting(dir === 'desc' ? [] : [{ id, desc: dir === 'asc' }])
    // 비제어 페이지는 정렬이 바뀌면 1페이지로. 제어형이면 바깥(URL)이 정한다
    if (pageIndexProp === undefined && page !== 0) setPageIndex(0)
  }

  const grid = (
    <div ref={responsive ? measure : undefined} className={cn(s.scroll, scrollClassName)}>
      <table className={cn(s.table, tableClassName)}>
        <thead>
          <tr>
            {selectable && (
              <th className={th('w-[36px] pr-0')}>
                <Checkbox
                  aria-label="이 페이지의 행 모두 선택"
                  checked={rows.length > 0 && table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
                  onChange={table.getToggleAllPageRowsSelectedHandler()}
                  disabled={loading}
                />
              </th>
            )}
            {headers.map((header) => {
              const meta = header.column.columnDef.meta
              const right = meta?.align === 'right'
              const canSort = header.column.getCanSort()
              // 보조 정렬 열은 정렬된 것으로 보이지 않게, 엔진 상태가 아니라 받은 정렬(첫 항목)로 표시한다
              const dir = active?.id === header.column.id ? (active.desc ? 'desc' : 'asc') : false
              const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ChevronsUpDown
              return (
                <th
                  key={header.id}
                  className={th(right ? 'text-right' : undefined)}
                  aria-sort={canSort ? (dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none') : undefined}
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(header.column.id, dir)}
                      className={cn(
                        'group/sort inline-flex cursor-pointer items-center gap-[4px] transition-colors hover:text-ink',
                        dir && 'text-ink',
                      )}
                    >
                      <table.FlexRender header={header} />
                      <Icon
                        aria-hidden
                        className={cn(
                          'size-[12px] transition-opacity',
                          dir ? 'opacity-100' : 'opacity-50 group-hover/sort:opacity-100',
                        )}
                      />
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              )
            })}
            {trailing && (
              // relative: sr-only가 표의 가로 스크롤 상자 밖(main) 기준으로 잡혀 좁은 화면에서 main을 가로로 늘리는 것을 막는다.
              // sticky도 위치 지정이라 같은 역할을 하므로, 둘이 겹치면 sticky를 남긴다
              <th className={th(stickyHeader ? undefined : 'relative')}>
                <span className="sr-only">{rowActions ? 'Actions' : 'Open'}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }, (_, i) => (
                <tr key={i} aria-hidden>
                  {selectable && (
                    <td className={td('w-[36px] pr-0')}>
                      <Checkbox disabled tabIndex={-1} />
                    </td>
                  )}
                  {headers.map((header, j) => (
                    <td key={header.id} className={td()}>
                      <Skeleton
                        className={cn(
                          'h-[12px]',
                          j === 0 ? 'w-[140px]' : 'w-[64px]',
                          header.column.columnDef.meta?.align === 'right' && 'ml-auto',
                        )}
                      />
                    </td>
                  ))}
                  {trailing && <td className={td('w-10')} />}
                </tr>
              ))
            : rows.map((row, index) => {
                const selected = row.getIsSelected()
                const href = getRowHref?.(row.original)
                const groupKey = groupBy?.key(row.original)
                const groupStart = groupBy !== undefined && (index === 0 || groupBy.key(rows[index - 1].original) !== groupKey)
                return (
                  <Fragment key={row.id}>
                    {groupStart && (
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={headers.length + (selectable ? 1 : 0) + (trailing ? 1 : 0)}
                          className={cn(
                            'h-[30px] border-t bg-sunken/60 text-left text-xs font-medium text-ink-soft',
                            index === 0 && 'border-t-0',
                            compact ? 'px-[12px]' : 'px-4',
                          )}
                        >
                          {groupBy.label(row.original, groupCounts.get(groupKey!) ?? 0)}
                        </th>
                      </tr>
                    )}
                  <tr
                    onClick={href ? () => navigate(href) : onRowClick ? () => onRowClick(row.original) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              onRowClick(row.original)
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-current={activeRowId === row.id ? 'true' : undefined}
                    aria-selected={selectable ? selected : undefined}
                    className={cn(
                      'group',
                      (href || onRowClick) && 'cursor-pointer',
                      onRowClick && 'outline-none focus-visible:bg-accent-subtle',
                      appearance === 'ruled' && activeRowId === row.id && s.selected,
                      s.tr,
                      appearance === 'ruled' && selected && s.selected,
                      // ruled + sticky: 헤더 아래 선(after)이 있으니 첫 행의 윗선은 빼서 2px로 겹치지 않게 한다
                      appearance === 'ruled' && stickyHeader && 'first:[&>td]:border-t-0',
                    )}
                  >
                    {selectable && (
                      <td
                        className={td('w-[36px] pr-0', appearance === 'cards' && selected && s.selected)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          aria-label={`${row.id} 선택`}
                          checked={selected}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta
                      return (
                        <td
                          key={cell.id}
                          className={td(
                            meta?.align === 'right' && 'text-right',
                            meta?.cellClassName,
                            appearance === 'cards' && selected && s.selected,
                          )}
                        >
                          <table.FlexRender cell={cell} />
                        </td>
                      )
                    })}
                    {rowActions ? (
                      <td
                        className={td('w-[44px] pr-[8px] text-right', appearance === 'cards' && selected && s.selected)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex">{rowActions(row.original)}</span>
                      </td>
                    ) : (
                      href && (
                        <td className={td('w-10 text-right', appearance === 'cards' && selected && s.selected)}>
                          <ChevronRight className="inline size-4 text-ink-mute opacity-50 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </td>
                      )
                    )}
                  </tr>
                  </Fragment>
                )
              })}
        </tbody>
      </table>
    </div>
  )

  // 정렬·선택·페이지가 없는 표(Overview)는 스크롤 영역 하나만 그린다
  if (!selectable && pageSize === undefined && !columnsMenu) return grid

  return (
    <div className={className}>
      {columnsMenu && (
        <div className="mb-[8px] flex justify-end">
          <ColumnsMenu columns={columns} value={columnVisibility} onChange={setColumnVisibility} />
        </div>
      )}

      {selectedIds.length > 0 && (
        <div
          role="status"
          className="mb-[8px] flex h-[40px] items-center gap-[10px] rounded-sm border border-line-strong bg-accent-subtle px-[14px] text-sm"
        >
          <span>
            <Value value={selectedIds.length} className="font-semibold" />
            {selectionUnit} 선택됨
          </span>
          {bulkActions && (
            <>
              <span className="h-[16px] w-px bg-line-strong" aria-hidden />
              <div className="flex items-center gap-[6px]">{bulkActions(selectedIds)}</div>
            </>
          )}
          <span className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setSelection({})}>
            선택 해제
          </Button>
        </div>
      )}

      {grid}

      {pageSize !== undefined && !loading && (
        <Pagination
          className="mt-[10px]"
          pageIndex={page}
          pageSize={pageSize}
          total={data.length}
          onPageChange={setPageIndex}
        />
      )}
    </div>
  )
}
