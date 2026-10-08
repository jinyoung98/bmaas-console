import { Copy, KeyRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { AreaChart } from '@/components/data/AreaChart'
import { KeyValueList } from '@/components/data/KeyValueList'
import { Mono, Value } from '@/components/data/Mono'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'
import { formatClock, RANGE_LABEL, RANGES, type Range } from '@/lib/format'
import { isLiveStatus } from '@/lib/status'
import { serverSeries } from '@/mock/metrics'
import { serverInterfaces, serverNetworkInfo, serverSshKeys } from '@/mock/selectors'
import type { Server } from '@/mock/types'
import { IdleNotice } from './IdleNotice'
import { TWO_COLUMN } from './OverviewTab'

const th = 'whitespace-nowrap px-[20px] py-[10px] text-left text-xs font-medium text-ink-mute'
const td = 'whitespace-nowrap px-[20px] py-[10px] text-sm'

function Interfaces({ server: s }: { server: Server }) {
  const rows = serverInterfaces(s)
  return (
    <Panel>
      <PanelHeader title="Interfaces" />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Name', 'Speed', 'IP address', 'Network', 'State'].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t">
                <td className={td}>
                  <Mono>{r.name}</Mono>
                </td>
                <td className={td}>
                  <Value value={r.speedGbps} unit="Gbps" />
                </td>
                <td className={td}>
                  <Mono>{r.ip}</Mono>
                </td>
                <td className={td}>
                  <Mono>{r.network}</Mono>
                </td>
                <td className={td}>
                  <span className={cn('inline-flex items-center gap-[6px]', r.up ? 'text-ink' : 'text-st-error')}>
                    <span className={cn('size-[6px] rounded-full', r.up ? 'bg-st-running' : 'bg-st-error')} />
                    {r.up ? 'Up' : 'Down'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Traffic({ server: s }: { server: Server }) {
  const [range, setRange] = useState<Range>('24h')
  const data = useMemo(() => serverSeries(s, 'network', range), [s, range])
  if (!isLiveStatus(s.status)) return <IdleNotice server={s} />
  return (
    <Panel>
      <PanelHeader
        title="Traffic"
        description={`${RANGE_LABEL[range]} · 사용 대역폭`}
        actions={<SegmentedControl value={range} onValueChange={setRange} options={[...RANGES]} />}
      />
      <div role="img" aria-label="네트워크 사용 대역폭 추이" className="px-[16px] pb-[16px] pt-[20px]">
        <AreaChart
          data={data}
          height={240}
          domain={[0, 'auto']}
          unit="Gbps"
          formatTick={(t) => formatClock(t, range)}
          formatTooltipTime={(t) => formatClock(t, range, true)}
        />
      </div>
    </Panel>
  )
}

function SshKeys({ server: s }: { server: Server }) {
  const command = `ssh ubuntu@${s.ip}`
  const copy = () => {
    navigator.clipboard?.writeText(command).catch(() => {})
    toast('접속 명령을 복사했습니다')
  }
  return (
    <Panel>
      <PanelHeader
        title="SSH keys"
        actions={
          <Button asChild variant="ghost" size="sm" className="-mr-2.5">
            <Link to="/ssh-keys">Manage</Link>
          </Button>
        }
      />
      <PanelBody>
        <ul className="space-y-[8px]">
          {serverSshKeys(s).map((k) => (
            <li key={k} className="flex items-center gap-[8px] text-sm">
              <KeyRound className="size-[14px] text-ink-mute" />
              <Mono>{k}</Mono>
            </li>
          ))}
        </ul>
        <div className="mt-[16px] flex items-center justify-between gap-[8px] rounded-md border bg-sunken py-[4px] pl-[12px] pr-[4px]">
          <Mono className="min-w-0 truncate text-xs">{command}</Mono>
          <Button size="icon" variant="ghost" aria-label="접속 명령 복사" className="size-[28px]" onClick={copy}>
            <Copy />
          </Button>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function NetworkTab({ server: s }: { server: Server }) {
  const { gateway, dns } = serverNetworkInfo(s)
  return (
    <div className={TWO_COLUMN}>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-[16px]">
        <Interfaces server={s} />
        <Traffic server={s} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-[16px]">
        <Panel>
          <PanelHeader title="Network info" />
          <PanelBody>
            <KeyValueList
              items={[
                { label: 'Private IP', value: <Mono>{s.ip}</Mono> },
                { label: 'Ports', value: <Mono>{`${s.network.ports} × ${s.network.speedGbps} Gbps`}</Mono> },
                { label: 'Gateway', value: <Mono>{gateway}</Mono> },
                { label: 'DNS', value: <Mono>{dns}</Mono> },
              ]}
            />
          </PanelBody>
        </Panel>
        <SshKeys server={s} />
      </div>
    </div>
  )
}
