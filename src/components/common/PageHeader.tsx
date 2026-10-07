import type { ReactNode } from 'react'
import { Breadcrumb, type Crumb } from '@/components/layout/Breadcrumb'
import { Eyebrow } from './Eyebrow'

type Props = {
  /** 최상위 페이지의 작은 라벨. 상세 페이지에서는 breadcrumb을 쓴다 */
  eyebrow?: string
  breadcrumb?: Crumb[]
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, breadcrumb, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b px-5 pb-6 pt-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:px-8 md:pt-8">
      <div className="min-w-0">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className={(breadcrumb || eyebrow ? 'mt-2 ' : '') + 'text-2xl font-semibold tracking-tight'}>{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
