import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { KeyValueList } from '@/components/data/KeyValueList'
import { Mono, Value } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { ActivityTimelineItem } from '@/features/overview/ActivityTimelineItem'
import { UtilizationPanel } from '@/features/overview/UtilizationPanel'
import { formatKRW, formatUptime } from '@/lib/format'
import { isLiveStatus } from '@/lib/status'
import { DETAIL_METRICS, serverMeans, serverSeries, type DetailMetric } from '@/mock/metrics'
import { regionById } from '@/mock/regions'
import { serverActivity } from '@/mock/selectors'
import type { Server } from '@/mock/types'
import { GpuPanel } from './GpuPanel'
import { IdleNotice } from './IdleNotice'

/** 왼쪽은 가변, 오른쪽 레일은 340px 고정. 탭마다 같은 2열을 쓴다 */
export const TWO_COLUMN = 'grid grid-cols-[minmax(0,1fr)] items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_340px]'

const OVERVIEW_KEYS: DetailMetric[] = ['cpu', 'memory', 'storage', 'network']

const date = (at: number) => new Date(at).toLocaleDateString('en-CA')

function Details({ server: s }: { server: Server }) {
  const region = regionById[s.region]
  return (
    <Panel>
      <PanelHeader title="Details" />
      <PanelBody>
        <KeyValueList
          items={[
            { label: 'Status', value: <StatusBadge status={s.status} /> },
            {
              label: 'Location',
              value: (
                <>
                  {region.city} <Mono className="text-xs text-ink-mute">{region.id}</Mono>
                </>
              ),
            },
            { label: 'IP address', value: <Mono>{s.ip}</Mono> },
            { label: 'OS', value: s.os ?? <span className="text-ink-mute">—</span> },
            { label: 'Uptime', value: <Mono>{isLiveStatus(s.status) ? formatUptime(s.uptimeSec) : '—'}</Mono> },
            { label: 'Created', value: <Mono>{date(s.createdAt)}</Mono> },
            { label: 'Monthly cost', value: <Value value={formatKRW(s.monthlyCost)} unit="/ 월" /> },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

function ServerActivity({ server: s }: { server: Server }) {
  const events = useMemo(() => serverActivity(s).slice(0, 6), [s])
  return (
    <Panel>
      <PanelHeader
        title="Recent activity"
        actions={
          <Button asChild variant="ghost" size="sm" className="-mr-2.5">
            <Link to={`/activity?server=${s.hostname}`}>
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <ol className="p-[20px]">
        {events.map((e, i) => (
          <ActivityTimelineItem key={e.id} event={e} last={i === events.length - 1} showHost={false} />
        ))}
      </ol>
    </Panel>
  )
}

export function OverviewTab({ server: s }: { server: Server }) {
  const means = useMemo(() => serverMeans(s), [s])
  const live = isLiveStatus(s.status)
  return (
    <div className={TWO_COLUMN}>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-[16px]">
        {live ? (
          <>
            <UtilizationPanel
              key={s.id}
              means={means}
              keys={OVERVIEW_KEYS}
              info={DETAIL_METRICS}
              getData={(m, range) => serverSeries(s, m, range)}
              description={(label) => `${label} · ${s.hostname}`}
            />
            <GpuPanel server={s} />
          </>
        ) : (
          <IdleNotice server={s} />
        )}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-[16px]">
        <Details server={s} />
        <ServerActivity server={s} />
      </div>
    </div>
  )
}
