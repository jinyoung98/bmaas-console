import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Mono } from '@/components/data/Mono'
import { StatusDot } from '@/components/data/StatusDot'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { relativeTime } from '@/lib/format'
import type { ActivityEvent } from '@/mock/types'

/** 세로선으로 이어진 타임라인. 중요도는 상태 점의 색으로만 표현한다 */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Panel className="h-full">
      <PanelHeader
        title="Recent activity"
        description="서버에서 일어난 일"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/activity">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <ol className="px-5 py-4">
        {events.map((e, i) => (
          <li
            key={e.id}
            className={
              'relative pb-5 pl-6 last:pb-0 ' +
              (i < events.length - 1 ? "before:absolute before:bottom-0 before:left-[3.5px] before:top-4 before:w-px before:bg-line before:content-['']" : '')
            }
          >
            <span className="absolute left-0 top-[7px] rounded-full bg-surface p-[1px]">
              <StatusDot status={e.severity} />
            </span>
            <p className="text-sm leading-snug">
              <Mono className="font-medium">{e.hostname}</Mono> <span className="text-ink-soft">{e.text}</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-mute">{relativeTime(e.at)}</p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
