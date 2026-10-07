import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Item = { label: string; value: ReactNode }

/** Stripe 식 라벨-값 정렬. 라벨은 고정 폭 왼쪽 열, 값은 오른쪽 열에 맞춘다 */
export function KeyValueList({ items, className }: { items: Item[]; className?: string }) {
  return (
    <dl className={cn('divide-y', className)}>
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-[120px_1fr] items-baseline gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-ink-mute">{it.label}</dt>
          <dd className="min-w-0 truncate text-sm text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
