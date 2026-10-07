import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Mono, Value } from '@/components/data/Mono'
import { StatusDot } from '@/components/data/StatusDot'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { relativeTime } from '@/lib/format'
import type { Server } from '@/mock/types'

const th = 'h-9 px-5 text-left text-xs font-medium text-ink-mute first:pl-5 last:pr-5'
const td = 'h-11 whitespace-nowrap px-5 align-middle'

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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b">
              <th className={th}>Hostname</th>
              <th className={th}>Location</th>
              <th className={th}>CPU</th>
              <th className={`${th} text-right`}>Memory</th>
              <th className={th}>IP address</th>
              <th className={`${th} text-right`}>Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {servers.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/servers/${s.id}`)}
                className="cursor-pointer transition-colors hover:bg-accent-subtle"
              >
                <td className={td}>
                  <Link to={`/servers/${s.id}`} className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <StatusDot status={s.status} />
                    <Mono className="font-medium">{s.hostname}</Mono>
                  </Link>
                </td>
                <td className={td}>
                  <Mono className="text-ink-soft">{s.region}</Mono>
                </td>
                <td className={td}>
                  <Mono className="text-ink-soft">{s.cpu.model}</Mono>
                </td>
                <td className={`${td} text-right`}>
                  <Value value={s.memoryGB} unit="GB" />
                </td>
                <td className={td}>
                  <Mono className="text-ink-soft">{s.ip}</Mono>
                </td>
                <td className={`${td} text-right text-ink-mute`}>{relativeTime(s.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
