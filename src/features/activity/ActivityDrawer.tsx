import { ArrowUpRight, Link2, X } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { KeyValueList } from '@/components/data/KeyValueList'
import { Mono } from '@/components/data/Mono'
import { StatusIcon } from '@/components/data/StatusIcon'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetClose, SheetContent } from '@/components/ui/Sheet'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { STATUS_LABEL, STATUS_TEXT } from '@/lib/status'
import { regionById } from '@/mock/regions'
import { servers } from '@/mock/servers'
import type { ActivityEvent } from '@/mock/types'

const ACTOR_KIND = { user: '사용자', system: '자동 감지', provider: '브릭섬 운영팀' } as const

const pad = (n: number) => String(n).padStart(2, '0')
const formatFull = (at: number) => {
  const d = new Date(at)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatSpan(ms: number) {
  const m = Math.max(1, Math.round(ms / 60_000))
  if (m < 60) return `${m}분`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}시간 ${m % 60}분` : `${Math.floor(h / 24)}일 ${h % 24}시간`
}

/** 이슈(Warning·Error)의 진행 여부. 그 밖의 이벤트는 일어난 일 하나라서 없다 */
function issueState(e: ActivityEvent): { open: boolean; text: string } | null {
  if (e.severity !== 'warning' && e.severity !== 'error') return null
  return e.resolvedAt === undefined
    ? { open: true, text: `지금도 진행 중 · ${formatSpan(Date.now() - e.at)}째` }
    : { open: false, text: `해소됨 · ${formatSpan(e.resolvedAt - e.at)} 지속` }
}

/** 고객이 이 이벤트를 보고 무엇을 알면 되는지. 별달리 할 말이 없는 이벤트는 null */
function guidance(e: ActivityEvent, open: boolean): string | null {
  if (e.severity === 'error')
    return open
      ? '서버가 응답하지 않아 올라가 있던 작업이 멈췄을 수 있습니다. 브릭섬 운영팀에 자동으로 전달되었고, 복구되면 이 이벤트가 해소로 바뀝니다. 급하면 지원팀에 문의하세요.'
      : '복구되었습니다. 멈췄던 작업이 있다면 다시 확인해 보세요.'
  if (e.severity === 'warning')
    return open
      ? '서버는 아직 동작 중입니다. 이 상태가 이어지면 성능이 떨어지거나 보호를 위해 꺼질 수 있으니 워크로드를 점검해 보세요. 운영팀도 같은 알림을 받았습니다.'
      : '이미 해소된 경고입니다. 별도 조치는 필요 없습니다.'
  if (e.severity === 'maintenance') return '브릭섬 운영팀이 진행하는 작업입니다. 끝나면 자동으로 정상 운영으로 돌아오고, 그동안은 서버를 조작할 수 없습니다.'
  return null
}

type Props = { event: ActivityEvent | null; onClose: () => void }

/**
 * 행을 누르면 오른쪽에서 열리는 상세. 목록은 그대로 두고(필터와 스크롤 유지) 패널만 겹친다.
 * 문장 하나로는 알 수 없는 것 — 지금도 진행 중인지, 누가 했는지, 고객이 할 일이 있는지 — 을 말한다.
 */
export function ActivityDrawer({ event, onClose }: Props) {
  const state = event && issueState(event)
  const note = event && guidance(event, state?.open ?? false)
  const server = event && servers.find((s) => s.hostname === event.hostname)

  return (
    <Sheet open={event !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" title="이벤트 상세">
        {event && (
          <>
            <header className="flex items-center gap-[8px] border-b px-[16px] py-[10px]">
              <StatusIcon status={event.severity} />
              <span className={cn('text-xs font-semibold', STATUS_TEXT[event.severity])}>{STATUS_LABEL[event.severity]}</span>
              <span className="num text-xs text-ink-mute">{relativeTime(event.at)}</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label="닫기" className="ml-auto">
                  <X />
                </Button>
              </SheetClose>
            </header>

            <div className="grid flex-1 content-start gap-[20px] overflow-auto p-[16px]">
              <div>
                <h3 className="text-base font-semibold leading-6">{event.text}</h3>
                {state && (
                  <p className="mt-[6px] flex items-center gap-[8px] text-xs text-ink-soft">
                    <span className={cn('size-[8px] rounded-full', state.open ? 'bg-st-warning' : 'bg-st-running')} />
                    {state.text}
                  </p>
                )}
              </div>

              <KeyValueList
                items={[
                  { label: 'Server', value: <Mono className="font-medium">{event.hostname}</Mono> },
                  ...(server ? [{ label: 'Location', value: regionById[server.region].city }] : []),
                  { label: 'Occurred', value: <Mono>{formatFull(event.at)}</Mono> },
                  ...(event.resolvedAt !== undefined ? [{ label: 'Resolved', value: <Mono>{formatFull(event.resolvedAt)}</Mono> }] : []),
                  { label: 'By', value: `${event.actor.name} · ${ACTOR_KIND[event.actor.kind]}` },
                  { label: 'Event ID', value: <Mono className="text-ink-soft">{event.id}</Mono> },
                ]}
              />

              {note && (
                <section className="rounded-md border bg-sunken/60 p-[12px]">
                  <h4 className="text-xs font-semibold">안내</h4>
                  <p className="mt-[4px] text-[13px] leading-5 text-ink-soft">{note}</p>
                </section>
              )}
            </div>

            <footer className="flex items-center gap-[8px] border-t px-[16px] py-[12px]">
              <Button asChild>
                <Link to={`/servers/${event.hostname}`}>
                  서버 보기 <ArrowUpRight />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => {
                  void navigator.clipboard?.writeText(window.location.href)
                  toast('링크를 복사했습니다')
                }}
              >
                <Link2 /> 링크 복사
              </Button>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
