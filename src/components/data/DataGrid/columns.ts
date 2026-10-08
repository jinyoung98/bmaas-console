import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'

/** 열마다 붙이는 표시 정보. 엔진(TanStack)은 값과 상태만 다루고, 모양은 이 메타로 정한다 */
export type GridMeta = {
  /** Columns 메뉴와 정렬 버튼의 aria-label에 쓰는 이름 */
  label: string
  align?: 'right'
  /** 끌 수 없는 열(Hostname 등) */
  required?: boolean
  /** td에 덧붙일 클래스(글자색 등) */
  cellClassName?: string
  /** 이 열로 정렬할 때 값이 같은 행끼리는 이 열의 오름차순으로 다시 정렬한다(정렬 방향과 상관없이) */
  thenBy?: string
  /**
   * 표가 놓인 영역이 이 폭(px)보다 좁으면 자동으로 숨긴다. 값이 클수록 먼저 사라지므로 이 값이 곧 우선순위다.
   * Columns 메뉴의 상태와는 별개라, 영역이 다시 넓어지면 돌아온다
   */
  hideBelow?: number
}

/**
 * DataGrid가 쓰는 기능 묶음. v9는 기능을 명시적으로 등록해야 해당 API와 상태가 생긴다.
 * 모든 DataGrid가 같은 묶음을 공유하므로 모듈 스코프에 한 번만 만든다.
 */
export const gridFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  rowSelectionFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<GridMeta>(),
})

export type GridFeatures = typeof gridFeatures
// 열마다 값 타입이 다르므로 배열로 모을 때는 any로 넓힌다
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GridColumn<T extends RowData> = ColumnDef<GridFeatures, T, any>

/** 데이터 타입에 묶인 열 정의 도우미. accessor의 값 타입이 정렬 함수까지 이어진다 */
export const createGridColumns = <T extends RowData>() => createColumnHelper<GridFeatures, T>()
