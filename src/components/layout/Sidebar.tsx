import { ArrowUpRight } from 'lucide-react'
import { NavLink } from 'react-router'
import { Eyebrow } from '@/components/common/Eyebrow'
import { Meter } from '@/components/data/Meter'
import { Mono } from '@/components/data/Mono'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { navGroups, type NavItem as Item } from './nav'

type Variant = 'full' | 'rail'

function NavItem({ item, variant, onNavigate }: { item: Item; variant: Variant; onNavigate?: () => void }) {
  const rail = variant === 'rail'
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      aria-label={rail ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex items-center rounded-sm text-sm text-ink-soft transition-colors hover:bg-accent-subtle hover:text-ink',
          rail ? 'size-10 justify-center' : 'h-8 gap-2.5 px-2',
          isActive && 'bg-accent-subtle font-semibold text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" />}
          <Icon className="size-4 shrink-0" strokeWidth={1.6} />
          {!rail && <span className="flex-1">{item.label}</span>}
          {!rail && item.count !== undefined && (
            <Mono className="rounded-sm bg-sunken px-1.5 text-[11px] font-normal leading-[18px] text-ink-soft">{item.count}</Mono>
          )}
        </>
      )}
    </NavLink>
  )

  // NavLink의 className은 함수라서 Tooltip의 asChild가 합치지 못한다. 감싸는 span에 툴팁을 단다
  return rail ? (
    <Tooltip content={item.label} side="right">
      <span className="flex">{link}</span>
    </Tooltip>
  ) : (
    link
  )
}

function UsageFooter() {
  return (
    <div className="border-t px-5 py-4">
      <div className="flex items-baseline justify-between">
        <Eyebrow>이번 달 사용량</Eyebrow>
        <Mono className="text-xs text-ink-soft">64%</Mono>
      </div>
      <Meter value={64} alert={false} className="mt-2.5" />
      <p className="mt-2 text-xs text-ink-mute">
        <Mono className="text-ink-soft">$1,284</Mono> / <Mono>$2,000</Mono> 한도
      </p>
      <a href="#docs" className="mt-4 flex items-center gap-1 text-xs text-ink-mute transition-colors hover:text-ink">
        Documentation <ArrowUpRight className="size-3.5" />
      </a>
    </div>
  )
}

/** 사이드바 내용물. 데스크톱 풀 사이드바, 태블릿 아이콘 레일, 모바일 시트가 같은 컴포넌트를 쓴다 */
export function SidebarNav({ variant, onNavigate }: { variant: Variant; onNavigate?: () => void }) {
  const rail = variant === 'rail'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className={cn('flex flex-1 flex-col overflow-y-auto', rail ? 'items-center gap-1 py-4' : 'gap-6 px-3 py-5')}>
        {navGroups.map((g, gi) => (
          <div key={g.label} className={cn('flex flex-col gap-1', rail && 'items-center')}>
            {rail ? (
              gi > 0 && <hr className="my-2 w-6 border-line" />
            ) : (
              <Eyebrow className="px-2 pb-1.5">{g.label}</Eyebrow>
            )}
            {g.items.map((item) => (
              <NavItem key={item.to} item={item} variant={variant} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
      {!rail && <UsageFooter />}
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden w-[232px] shrink-0 flex-col border-r bg-surface lg:flex">
        <SidebarNav variant="full" />
      </aside>
      <aside className="hidden w-16 shrink-0 flex-col border-r bg-surface md:flex lg:hidden">
        <SidebarNav variant="rail" />
      </aside>
    </>
  )
}
