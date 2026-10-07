import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'

export type Crumb = { label: string; to?: string }

/** 마지막 항목이 현재 위치다. 호스트명 같은 값은 Mono로 넘겨도 되도록 label은 문자열만 받는다 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-mute">
      {items.map((c, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={c.label}>
            {i > 0 && <ChevronRight className="size-3.5 shrink-0" strokeWidth={1.6} />}
            {c.to && !last ? (
              <Link to={c.to} className="transition-colors hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink-soft' : undefined}>
                {c.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
