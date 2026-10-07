import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Mono } from '@/components/data/Mono'
import { StatusDot } from '@/components/data/StatusDot'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Tooltip } from '@/components/ui/Tooltip'
import type { ServerStatus } from '@/lib/status'

type Note = { id: number; status: ServerStatus; body: React.ReactNode; time: string; unread: boolean }

const initial: Note[] = [
  { id: 1, status: 'warning', body: <><Mono>bm-seoul-03</Mono> CPU 온도가 82°C를 넘었습니다</>, time: '12분 전', unread: true },
  { id: 2, status: 'running', body: <><Mono>bm-busan-02</Mono> 배포가 완료되었습니다</>, time: '1시간 전', unread: true },
  { id: 3, status: 'maintenance', body: <><Mono>kr-gwangju-1</Mono> 정기 점검이 10월 12일 02:00에 예정되어 있습니다</>, time: '어제', unread: false },
]

export function NotificationsMenu() {
  const [notes, setNotes] = useState(initial)
  const unread = notes.filter((n) => n.unread).length

  return (
    <Popover>
      <Tooltip content="Notifications">
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" className="relative" aria-label={`알림 ${unread}개`}>
            <Bell />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-st-error ring-2 ring-raised" />}
          </Button>
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent className="w-[min(380px,calc(100vw-24px))]">
        <div className="flex h-11 items-center justify-between border-b px-4">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <button
            type="button"
            disabled={unread === 0}
            onClick={() => setNotes((ns) => ns.map((n) => ({ ...n, unread: false })))}
            className="cursor-pointer text-xs text-ink-mute transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>

        <ul className="divide-y">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3 px-4 py-3">
              <span className="mt-[7px]">
                <StatusDot status={n.status} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={n.unread ? 'text-sm text-ink' : 'text-sm text-ink-soft'}>{n.body}</p>
                <p className="mt-0.5 text-xs text-ink-mute">{n.time}</p>
              </div>
              {n.unread && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-label="읽지 않음" />}
            </li>
          ))}
        </ul>

        <Link to="/activity" className="flex h-10 items-center justify-center border-t text-xs text-ink-soft transition-colors hover:text-ink">
          View all activity
        </Link>
      </PopoverContent>
    </Popover>
  )
}
