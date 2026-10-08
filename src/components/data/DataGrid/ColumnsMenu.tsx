import type { ColumnVisibilityState, RowData } from '@tanstack/react-table'
import { ChevronDown, Columns3 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { GridColumn } from './columns'

type Props<T extends RowData> = {
  columns: GridColumn<T>[]
  value: ColumnVisibilityState
  onChange: (next: ColumnVisibilityState) => void
}

/**
 * 열 표시 전환. 같은 열 정의(meta.label, meta.required)를 읽어서 DataGrid와 따로 놓아도 어긋나지 않는다.
 * 필수 열은 끌 수 없고, 항목을 눌러도 메뉴가 닫히지 않아 여러 개를 연달아 바꿀 수 있다.
 */
export function ColumnsMenu<T extends RowData>({ columns, value, onChange }: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-[32px] cursor-pointer items-center gap-[8px] rounded-sm border bg-raised px-[10px] text-sm text-ink-soft transition-colors hover:border-line-strong data-[state=open]:border-line-strong"
        >
          <Columns3 className="size-[14px] text-ink-mute" />
          Columns
          <ChevronDown className="size-[14px] text-ink-mute" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>표시할 열</DropdownMenuLabel>
        {columns.map((c) => {
          const id = c.id!
          const meta = c.meta!
          return (
            <DropdownMenuCheckboxItem
              key={id}
              checked={value[id] !== false}
              disabled={meta.required}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(on) => onChange({ ...value, [id]: on })}
            >
              {meta.label}
              {meta.required && <span className="ml-auto text-[11px] text-ink-mute">필수</span>}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
