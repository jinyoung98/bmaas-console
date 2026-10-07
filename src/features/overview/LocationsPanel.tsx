import { BrickGrid } from '@/components/data/BrickGrid'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER } from '@/lib/status'
import type { Region, Server } from '@/mock/types'

type Props = { groups: { region: Region; servers: Server[] }[] }

/** 서버 8대 = 랙 1개. 서버 IP의 랙 번호(10.20.1.x, 10.20.2.x)와 같은 기준이다 */
export const RACK_SIZE = 8

/**
 * 리전별로 서버를 벽돌처럼 쌓아 보여준다. 한 리전은 세 줄로 읽힌다.
 * 1) 어느 리전이고 용량이 얼마인가  2) 서버가 어떻게 놓여 있는가(색 = 상태)  3) CPU는 얼마나 쓰는가
 */
export function LocationsPanel({ groups }: Props) {
  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Locations" description="각 블록은 서버 한 대, 색은 현재 상태" />

      {/* 색의 뜻을 읽기 전에 먼저 보이도록 위쪽에 둔다. 리전별 개수 줄이 이름을 다시 알려주므로 톤은 낮춘다 */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 border-b px-5 py-3">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-ink-mute">
            <span className={`size-2 rounded-[2px] ${STATUS_BG[s]}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <PanelBody className="flex-1 space-y-7 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-7 md:space-y-0 xl:block xl:space-y-7">
        {groups.map(({ region, servers }) => {
          const live = servers.filter((s) => s.status === 'running' || s.status === 'warning')
          const cpu = Math.round(live.reduce((sum, s) => sum + s.usage.cpu, 0) / Math.max(1, live.length))

          return (
            <div key={region.id}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <Mono className="text-sm font-medium">{region.id}</Mono>
                  <span className="text-xs text-ink-mute">{region.city}</span>
                </div>
                <Mono className="text-xs text-ink-mute">
                  <span className="text-ink-soft">{servers.length}</span> servers
                </Mono>
              </div>

              <BrickGrid
                bricks={servers.map((s, i) => ({
                  id: s.id,
                  label: s.hostname,
                  status: s.status,
                  to: `/servers/${s.id}`,
                  rack: Math.floor(i / RACK_SIZE) + 1,
                  unit: (i % RACK_SIZE) + 1,
                  cpu: s.status === 'running' || s.status === 'warning' ? s.usage.cpu : undefined,
                }))}
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
