import { Columns3, Rows3 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { BrickDetail, type Brick } from '@/components/data/BrickGrid'
import { Value } from '@/components/data/Mono'
import { StackBar } from '@/components/data/StackBar'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_ON, STATUS_ORDER, STATUS_RANK, STATUS_TINT } from '@/lib/status'
import { statusCounts } from '@/mock/selectors'
import type { Region, Server } from '@/mock/types'

type Props = { groups: { region: Region; servers: Server[] }[] }

/** 서버 8대 = 랙 1개. 서버 IP의 랙 번호(10.20.1.x, 10.20.2.x)와 같은 기준이다 */
export const RACK_SIZE = 8

const NOTE = '위치별 서버 상태 분포와 랙 배치'

type Layout = 'vertical' | 'horizontal'
const LAYOUT_OPTIONS = [
  { value: 'vertical' as const, icon: <Columns3 />, ariaLabel: '세로 랙' },
  { value: 'horizontal' as const, icon: <Rows3 />, ariaLabel: '가로 랙' },
]

/** rack = 서버가 늘 같은 랙 · 같은 칸에 있는 기본 보기. 이름 · 상태는 랙을 풀고 위치별 칩으로 정렬해 보여준다 */
type Arrange = 'rack' | 'name' | 'status'
const ARRANGE_OPTIONS: { value: Arrange; label: string }[] = [
  { value: 'rack', label: '랙' },
  { value: 'name', label: '이름' },
  { value: 'status', label: '상태' },
]

const byName = (a: Server, b: Server) => a.hostname.localeCompare(b.hostname, 'en', { numeric: true })
/** 칩 보기의 정렬. 이름 = 호스트명 순, 상태 = 문제 있는 서버가 앞(Error → Warning → Maintenance → Available → Running) */
const SORT = {
  name: byName,
  status: (a: Server, b: Server) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || byName(a, b),
}

/** 랙 보기: 어느 서버가 어느 랙 · 어느 칸에 있는지는 호스트명 순서로 고정이다. 작업할 때 위치를 믿을 수 있도록 정렬하지 않는다 */
function toRacks(servers: Server[]) {
  const ordered = [...servers].sort(byName)
  const racks: Server[][] = []
  for (let i = 0; i < ordered.length; i += RACK_SIZE) racks.push(ordered.slice(i, i + RACK_SIZE))
  return racks
}

function toBrick(s: Server, rack: number, unit: number): Brick {
  return {
    id: s.id,
    label: s.hostname,
    status: s.status,
    to: `/servers/${s.id}`,
    rack,
    unit,
  }
}

/** 블록 하나. 면 = 상태, 안의 숫자 = 호스트명 번호 */
function RackBrick({ brick }: { brick: Brick }) {
  const n = brick.label.split('-').pop()
  return (
    <Tooltip content={<BrickDetail b={brick} />}>
      <Link
        to={brick.to}
        aria-label={`${brick.label}, ${STATUS_LABEL[brick.status]}`}
        className={cn(
          'num relative grid aspect-square min-w-0 place-items-center overflow-hidden rounded-[5px] text-[10px] font-semibold leading-none @[480px]:text-[11px]',
          'outline-[1.5px] outline-offset-2 outline-transparent transition-[transform,outline-color] duration-150 hover:-translate-y-px hover:outline-ink-mute',
          STATUS_BG[brick.status],
          STATUS_ON[brick.status],
        )}
      >
        {n}
      </Link>
    </Tooltip>
  )
}

/** 세로 랙의 한 칸. 면 = 상태, 가운데 숫자 = 호스트명 번호 */
function RackUnit({ brick }: { brick: Brick }) {
  const n = brick.label.split('-').pop()
  return (
    <Tooltip content={<BrickDetail b={brick} />}>
      <Link
        to={brick.to}
        aria-label={`${brick.label}, ${STATUS_LABEL[brick.status]}`}
        className={cn(
          'num relative grid h-[24px] min-w-0 place-items-center overflow-hidden rounded-[4px] text-[11px] font-semibold leading-none',
          'outline-[1.5px] outline-offset-1 outline-transparent transition-[outline-color] duration-150 hover:outline-ink-mute',
          STATUS_BG[brick.status],
          STATUS_ON[brick.status],
        )}
      >
        {n}
      </Link>
    </Tooltip>
  )
}

/** 위치 머리. 상태 이름은 Fleet status 칩과 같은 말(Running · Available · Maintenance · Warning · Error)을 쓰고 Warning과 Error는 나눠 적는다 */
function LocationHead({ region, servers }: { region: Region; servers: Server[] }) {
  const c = statusCounts(servers)
  const healthy = Math.round((c.running / Math.max(1, servers.length)) * 100)

  return (
    <div className="mb-[14px] grid gap-[8px]">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[15px] font-semibold">{region.city}</span>
          <span className="num text-xs text-ink-mute">{region.id}</span>
        </div>
        <span className="flex items-baseline gap-[4px]">
          <Value value={healthy} unit="%" className="text-xl font-semibold leading-none" />
          <span className="text-xs text-ink-mute">Running · {servers.length} servers</span>
        </span>
      </div>
      <StackBar
        className="h-[8px]"
        segments={STATUS_ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s], value: c[s], className: STATUS_BG[s] }))}
      />
      <ul className="flex flex-wrap gap-x-[12px] gap-y-[2px] text-xs text-ink-soft">
        {STATUS_ORDER.filter((s) => c[s] > 0).map((s) => (
          <li key={s} className="flex items-center gap-[6px]">
            <span className={cn('size-[8px] rounded-[2px]', STATUS_BG[s])} />
            {STATUS_LABEL[s]}
            <Value value={c[s]} className="font-semibold text-ink" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 칩 보기의 서버 하나. 틴트 바탕 · 테두리 + 9px 원이 상태를 말하고, 이름은 호스트명에서 bm-을 뗀 것이다 */
function ServerChip({ server: s }: { server: Server }) {
  return (
    <Link
      to={`/servers/${s.id}`}
      aria-label={`${s.hostname}, ${STATUS_LABEL[s.status]}`}
      title={`${s.hostname} · ${STATUS_LABEL[s.status]}`}
      className={cn(
        'num inline-flex h-[26px] items-center gap-[6px] rounded-[5px] border px-[8px] text-xs font-medium whitespace-nowrap',
        'outline-[1.5px] outline-offset-1 outline-transparent transition-[outline-color] duration-150 hover:outline-ink-mute',
        STATUS_TINT[s.status],
      )}
    >
      <span className={cn('size-[9px] shrink-0 rounded-full', STATUS_BG[s.status])} />
      {s.hostname.replace(/^bm-/, '')}
    </Link>
  )
}

/**
 * 위치별로 서버를 보여준다. 위치 머리(Running 비율 · 상태 구성비 · 상태별 개수) 아래에 두 가지 보기가 있다.
 * - 랙(기본): 랙 상자 8칸. 서버가 늘 같은 자리에 있어서 정렬하지 않는다. 세로(기본) / 가로는 토글로 바꾼다.
 * - 이름 · 상태: 랙을 풀고 위치별 칩으로 정렬해서 보여준다. 정렬이 랙 안의 자리를 바꾸지 않도록 별도 보기로 둔 것이다.
 * 세로 랙은 한 위치에 랙이 최대 4개라고 보고 폭을 4등분한다. 가득 차지 않은 랙의 남는 칸은 점선으로 비워 둔다.
 */
export function LocationsPanel({ groups }: Props) {
  const [arrange, setArrange] = useState<Arrange>('rack')
  const [layout, setLayout] = useState<Layout>('vertical')
  const racked = arrange === 'rack'
  const vertical = layout === 'vertical'

  return (
    <Panel className="flex flex-col @container">
      <PanelHeader
        title="Locations"
        info={NOTE}
        actions={
          <div className="flex items-center gap-[8px]">
            {racked && <SegmentedControl value={layout} onValueChange={setLayout} options={LAYOUT_OPTIONS} />}
            <span className="ml-[4px] hidden text-xs text-ink-mute sm:inline">Arrange</span>
            <SegmentedControl value={arrange} onValueChange={setArrange} options={ARRANGE_OPTIONS} />
          </div>
        }
      />

      <PanelBody className="grid flex-1 grid-cols-1 content-start gap-x-[28px] gap-y-[28px] @[480px]:grid-cols-2 @[1000px]:grid-cols-4">
        {groups.map(({ region, servers }) => (
          <div key={region.id} className="min-w-0">
            <LocationHead region={region} servers={servers} />
            {racked ? (
              <div className={cn('grid gap-[8px]', vertical && 'grid-cols-4 gap-[6px]')}>
                {toRacks(servers).map((rack, ri) => (
                  <div key={ri} className={cn('min-w-0 rounded-md border bg-bg pb-[10px] pt-[8px]', vertical ? 'px-[6px]' : 'px-[10px]')}>
                    <div className="mb-[6px] flex items-baseline justify-between gap-[2px] text-[11px] text-ink-mute">
                      <b className="font-semibold text-ink-soft">R{ri + 1}</b>
                      <span className="num">
                        {rack.length}/{RACK_SIZE}
                      </span>
                    </div>
                    {vertical ? (
                      <div className="grid gap-[3px]">
                        {Array.from({ length: RACK_SIZE }, (_, ui) => (
                          <div key={ui}>
                            {rack[ui] ? (
                              <RackUnit brick={toBrick(rack[ui], ri + 1, ui + 1)} />
                            ) : (
                              <span aria-hidden className="block h-[24px] rounded-[4px] border-[1.5px] border-dashed border-line-strong opacity-70" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-8 gap-[4px]">
                        {rack.map((s, ui) => (
                          <RackBrick key={s.id} brick={toBrick(s, ri + 1, ui + 1)} />
                        ))}
                        {Array.from({ length: RACK_SIZE - rack.length }, (_, k) => (
                          <span key={`empty-${k}`} aria-hidden className="aspect-square rounded-[5px] border-[1.5px] border-dashed border-line-strong opacity-70" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-[5px]">
                {[...servers].sort(SORT[arrange]).map((s) => (
                  <ServerChip key={s.id} server={s} />
                ))}
              </div>
            )}
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}
