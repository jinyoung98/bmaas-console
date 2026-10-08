import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Props = {
  /** 0부터 시작 */
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  className?: string
}

/** 왼쪽에 범위(1–10 of 48), 오른쪽에 이전/다음. 페이지 번호 목록은 두지 않는다 */
export function Pagination({ pageIndex, pageSize, total, onPageChange, className }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(total, (pageIndex + 1) * pageSize)

  return (
    <nav aria-label="페이지" className={cn('flex items-center justify-between gap-4 px-[4px]', className)}>
      <span className="num text-xs text-ink-mute">
        {start}–{end} of {total}
      </span>
      <div className="flex gap-[6px]">
        <Button size="sm" disabled={pageIndex <= 0} onClick={() => onPageChange(pageIndex - 1)}>
          이전
        </Button>
        <Button size="sm" disabled={pageIndex >= pageCount - 1} onClick={() => onPageChange(pageIndex + 1)}>
          다음
        </Button>
      </div>
    </nav>
  )
}
