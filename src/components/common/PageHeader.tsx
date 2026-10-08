import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Breadcrumb, type Crumb } from '@/components/layout/Breadcrumb'
import { Eyebrow } from './Eyebrow'

type Props = {
  /** 최상위 페이지의 작은 라벨. 상세 페이지에서는 breadcrumb을 쓴다 */
  eyebrow?: string
  breadcrumb?: Crumb[]
  title: string
  description?: string
  actions?: ReactNode
  /** 제목 오른쪽에 붙는 배지·태그(상태, 유형) */
  titleAside?: ReactNode
  /** description 대신 쓰는 보조 줄. 값이 섞인 한 줄을 그대로 받는다 */
  meta?: ReactNode
  /** 호스트명처럼 기계가 말하는 값이 제목일 때 */
  mono?: boolean
  /** 아래 선. 헤더 아래에 알림 줄·스펙 띠가 이어지는 화면은 끈다 */
  bordered?: boolean
}

export function PageHeader({ eyebrow, breadcrumb, title, description, actions, titleAside, meta, mono, bordered = true }: Props) {
  const hasTop = !!(breadcrumb || eyebrow)
  const h1 = (
    <h1 className={cn(!titleAside && hasTop && 'mt-2', 'text-2xl font-semibold tracking-tight', mono && 'num')}>{title}</h1>
  )
  return (
    <div
      className={
        bordered
          ? 'flex flex-col gap-4 border-b px-5 pb-6 pt-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:px-8 md:pt-8'
          : 'flex flex-col gap-4 px-5 pt-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:px-8 md:pt-8'
      }
    >
      <div className="min-w-0">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {titleAside ? (
          <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', hasTop && 'mt-2')}>
            {h1}
            {titleAside}
          </div>
        ) : (
          h1
        )}
        {meta ?? (description && <p className="mt-1.5 max-w-xl text-sm text-ink-soft">{description}</p>)}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
