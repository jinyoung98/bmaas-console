import { ArrowRight, Check, Wrench, X, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router'
import { Mono } from '@/components/data/Mono'
import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { relativeTime } from '@/lib/format'
import { STATUS_LABEL, STATUS_TEXT, type ServerStatus } from '@/lib/status'
import { servers } from '@/mock/servers'
import type { ActivityEvent, RegionId } from '@/mock/types'

const regionByHostname = new Map<string, RegionId>(servers.map((s) => [s.hostname, s.region]))

// lucide에 없는 두 글리프. 세로선+점, 작은 속 빈 원
function Exclamation(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
      <path d="M12 6v8M12 18v.01" />
    </svg>
  )
}

function Ring(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

const GLYPH: Record<ServerStatus, ComponentType<LucideProps>> = {
  running: Check,
  error: X,
  warning: Exclamation,
  available: Ring,
  maintenance: Wrench,
}

/** 배경은 상태색 14%를 bg와 섞은 불투명 색이라 레일이 비치지 않는다. 링은 상태색 30% */
const TINT: Record<ServerStatus, string> = {
  running: 'bg-[color-mix(in_srgb,var(--st-running)_14%,var(--bg))] border-st-running/30',
  available: 'bg-[color-mix(in_srgb,var(--st-available)_14%,var(--bg))] border-st-available/30',
  maintenance: 'bg-[color-mix(in_srgb,var(--st-maintenance)_14%,var(--bg))] border-st-maintenance/30',
  warning: 'bg-[color-mix(in_srgb,var(--st-warning)_14%,var(--bg))] border-st-warning/30',
  error: 'bg-[color-mix(in_srgb,var(--st-error)_14%,var(--bg))] border-st-error/30',
}

const sep = <span className="mx-[6px] opacity-60">·</span>

/**
 * 박스 없는 목록. 세로선으로 이어진 타임라인이고, 상태는 틴트 링 아이콘과 메타 줄의 색 글자로만 전달한다.
 * 옆의 Recent servers 배지와 겹치지 않도록 배지는 두지 않는다.
 * 루트 폰트가 14px라 rem 기반 spacing(size-5 = 17.5px)으로는 아이콘 중심과 레일이 어긋난다. 그래서 치수는 px로 고정한다.
 */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Section className="border-t pt-4">
      <SectionHeader
        title="Recent activity"
        actions={
          <Button asChild variant="ghost" size="sm" className="-mr-2.5">
            <Link to="/activity">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <ol className="mt-[16px]">
        {events.map((e, i) => {
          const Glyph = GLYPH[e.severity]
          const region = regionByHostname.get(e.hostname)
          return (
            <li
              key={e.id}
              className={
                'relative flex gap-[12px] pb-[18px] last:pb-0 ' +
                (i < events.length - 1 ? "before:absolute before:bottom-[4px] before:left-[9.5px] before:top-[24px] before:w-px before:bg-line before:content-['']" : '')
              }
            >
              <span className={`grid size-[20px] shrink-0 place-items-center rounded-full border ${TINT[e.severity]} ${STATUS_TEXT[e.severity]}`}>
                <Glyph className="size-[12px]" strokeWidth={2.6} />
              </span>
              <div className="min-w-0">
                <Mono className="block text-sm font-medium">{e.hostname}</Mono>
                <p className="text-sm text-ink-soft">{e.text}</p>
                <p className="num mt-[2px] text-xs text-ink-mute">
                  <span className={`text-[11px] font-medium ${STATUS_TEXT[e.severity]}`}>{STATUS_LABEL[e.severity]}</span>
                  {region && (
                    <>
                      {sep}
                      {region}
                    </>
                  )}
                  {sep}
                  {relativeTime(e.at)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
