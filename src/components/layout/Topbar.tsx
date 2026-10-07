import { Menu, Moon, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'
import { Tooltip } from '@/components/ui/Tooltip'
import { AccountMenu } from '@/features/shell/AccountMenu'
import { EnvSwitcher } from '@/features/shell/EnvSwitcher'
import { NotificationsMenu } from '@/features/shell/NotificationsMenu'
import { useTheme } from '@/hooks/useTheme'
import { SidebarNav } from './Sidebar'

export function Topbar() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const dark = theme === 'dark'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-surface px-3 md:px-5">
      <div className="flex min-w-0 items-center gap-1 md:gap-3">
        {/* md 미만: 사이드바가 시트로 열린다 */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="메뉴 열기">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent title="Navigation">
            <div className="flex h-14 shrink-0 items-center border-b px-5">
              <Logo />
            </div>
            <SidebarNav variant="full" onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <Logo collapsible />
        <span className="hidden text-ink-mute/50 sm:block" aria-hidden>
          /
        </span>
        <EnvSwitcher />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden h-8 w-[280px] cursor-pointer items-center gap-2 rounded-md border bg-raised px-2.5 text-sm text-ink-mute transition-colors hover:border-line-strong lg:flex"
        >
          <Search className="size-4" strokeWidth={1.6} />
          <span>Search servers, IPs…</span>
          <Kbd className="ml-auto">⌘K</Kbd>
        </button>
        <Button variant="secondary" size="icon" className="lg:hidden" aria-label="검색">
          <Search />
        </Button>

        <NotificationsMenu />

        <Tooltip content={dark ? 'Light mode' : 'Dark mode'}>
          <Button variant="secondary" size="icon" onClick={toggle} aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            {dark ? <Sun /> : <Moon />}
          </Button>
        </Tooltip>

        <AccountMenu />
      </div>
    </header>
  )
}
