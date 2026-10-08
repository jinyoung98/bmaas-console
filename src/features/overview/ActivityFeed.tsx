import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { servers } from '@/mock/servers'
import type { ActivityEvent, RegionId } from '@/mock/types'
import { ActivityTimelineItem } from './ActivityTimelineItem'

const regionByHostname = new Map<string, RegionId>(servers.map((s) => [s.hostname, s.region]))

/**
 * 박스 없는 목록. 세로선으로 이어진 타임라인이고, 상태는 틴트 링 아이콘과 메타 줄의 색 글자로만 전달한다.
 * 옆의 Recent servers 배지와 겹치지 않도록 배지는 두지 않는다.
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
        {events.map((e, i) => (
          <ActivityTimelineItem key={e.id} event={e} last={i === events.length - 1} region={regionByHostname.get(e.hostname)} />
        ))}
      </ol>
    </Section>
  )
}
