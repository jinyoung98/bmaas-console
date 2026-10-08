import { HardDriveDownload, MoreHorizontal, Power, RotateCw, SquareTerminal, Trash2 } from 'lucide-react'
import type { SyntheticEvent } from 'react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/cn'
import type { Server } from '@/mock/types'

/** 고객사 관리자가 서버 한 대에 하는 조작. 동작은 mock이라 요청했다는 알림만 띄운다 */
const ACTIONS = [
  { key: 'reboot', label: '재부팅', request: '재부팅을', icon: RotateCw },
  { key: 'reinstall', label: 'OS 재설치', request: 'OS 재설치를', icon: HardDriveDownload },
  { key: 'console', label: '콘솔 접속', request: '콘솔 접속을', icon: SquareTerminal },
  { key: 'power-off', label: '전원 끄기', request: '전원 끄기를', icon: Power },
] as const

// 메뉴는 포털로 그려지지만 React 이벤트는 컴포넌트 트리를 따라 올라가므로, 행·카드의 클릭(상세 이동)까지 닿지 않게 막는다
const stop = (e: SyntheticEvent) => e.stopPropagation()

/** 표의 마지막 열과 서버 카드 오른쪽 위에 같이 쓰는 ⋯ 메뉴 */
export function ServerActionsMenu({ server, className }: { server: Server; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${server.hostname} 작업`}
          onClick={stop}
          className={cn(
            'grid size-[28px] cursor-pointer place-items-center rounded-sm text-ink-mute transition-colors',
            'hover:bg-accent-subtle hover:text-ink data-[state=open]:bg-accent-subtle data-[state=open]:text-ink',
            className,
          )}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]" onClick={stop}>
        {ACTIONS.map(({ key, label, request, icon: Icon }) => (
          <DropdownMenuItem key={key} onSelect={() => toast(`${server.hostname} ${request} 요청했습니다`)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-st-error data-[highlighted]:bg-st-error/10 [&_svg]:!text-st-error"
          onSelect={() => toast(`${server.hostname} 서버 해제를 요청했습니다`)}
        >
          <Trash2 />
          서버 해제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
