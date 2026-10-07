import { BrickGrid } from '@/components/data/BrickGrid'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER } from '@/lib/status'
import type { Region, Server } from '@/mock/types'

type Props = { groups: { region: Region; servers: Server[] }[] }

/** 리전별로 서버를 벽돌처럼 쌓아 보여준다. 어느 리전에 어떤 상태의 서버가 몰려 있는지 한눈에 읽힌다 */
export function LocationsPanel({ groups }: Props) {
  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Locations" description="각 블록은 서버 한 대, 색은 현재 상태" />

      {/* 범례를 읽기 전에 먼저 보이도록 위쪽에 둔다 */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 border-b px-5 py-3">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className={`size-2 rounded-[2px] ${STATUS_BG[s]}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <PanelBody className="flex-1 space-y-6">
        {groups.map(({ region, servers }) => {
          const running = servers.filter((s) => s.status === 'running').length
          const live = servers.filter((s) => s.status === 'running' || s.status === 'warning')
          const cpu = Math.round(live.reduce((sum, s) => sum + s.usage.cpu, 0) / Math.max(1, live.length))
          return (
            <div key={region.id}>
              <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <Mono className="text-sm font-medium">{region.id}</Mono>
                  <span className="text-xs text-ink-mute">{region.city}</span>
                </div>
                <Mono className="text-xs text-ink-mute">
                  <span className="text-ink-soft">{running}</span> / {servers.length} running
                </Mono>
              </div>
              <BrickGrid
                bricks={servers.map((s) => ({ id: s.id, label: s.hostname, status: s.status, to: `/servers/${s.id}` }))}
              />
              <div className="mt-3 grid grid-cols-[56px_1fr_36px] items-center gap-3 text-xs">
                <span className="text-ink-mute">CPU 평균</span>
                <Meter value={cpu} />
                <Value value={cpu} unit="%" className="text-right text-ink-soft" />
              </div>
            </div>
          )
        })}
      </PanelBody>
    </Panel>
  )
}
