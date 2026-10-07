import { ArrowRight, ChevronRight, Server as ServerIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Mono, Value } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { relativeTime } from '@/lib/format'
import { regionById } from '@/mock/regions'
import type { Server } from '@/mock/types'

const th = 'h-8 px-4 text-left text-xs font-medium text-ink-mute'
// 행 카드: 셀마다 위아래 테두리, 양 끝 셀만 좌우 테두리와 라운드를 줘서 한 장의 박스처럼 보이게 한다
const td =
  'h-13 whitespace-nowrap border-y border-line bg-raised px-4 align-middle transition-colors ' +
  'first:rounded-l-sm first:border-l last:rounded-r-sm last:border-r ' +
  'group-hover:border-line-strong group-hover:bg-accent-subtle'
const sub = 'num block text-[11px] leading-4 text-ink-mute'

export function RecentServers({ servers }: { servers: Server[] }) {
  const navigate = useNavigate()

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Recent servers"
        description="최근에 변경된 서버"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/servers">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <div className="overflow-x-auto px-3 pb-1.5">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-1.5 text-sm">
          <thead>
            <tr>
              <th className={th}>Hostname</th>
              <th className={th}>Location</th>
              <th className={th}>CPU</th>
              <th className={`${th} text-right`}>Memory</th>
              <th className={th}>IP address</th>
              <th className={`${th} text-right`}>Updated</th>
              <th className={th}>
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {servers.map((s) => (
              <tr key={s.id} onClick={() => navigate(`/servers/${s.id}`)} className="group cursor-pointer">
                <td className={td}>
                  <div className="flex items-center gap-2.5">
                    <ServerIcon className="size-4 shrink-0 text-ink-mute" />
                    <Link to={`/servers/${s.id}`} onClick={(e) => e.stopPropagation()}>
                      <Mono className="font-medium">{s.hostname}</Mono>
                    </Link>
                    <StatusBadge status={s.status} />
                  </div>
                </td>
                <td className={td}>
                  {regionById[s.region].city}
                  <span className={sub}>{s.region}</span>
                </td>
                <td className={td}>
                  <Mono className="text-ink-soft">{s.cores} Core</Mono>
                  <span className={sub}>{s.cpu.model}</span>
                </td>
                <td className={`${td} text-right`}>
                  <Value value={s.memoryGB} unit="GB" />
                </td>
                <td className={td}>
                  <Mono className="text-ink-soft">{s.ip}</Mono>
                </td>
                <td className={`${td} text-right text-ink-mute`}>{relativeTime(s.updatedAt)}</td>
                <td className={`${td} w-10 text-right`}>
                  <ChevronRight className="inline size-4 text-ink-mute opacity-50 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
