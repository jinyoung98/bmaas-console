import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { BrickDetail } from '@/components/data/BrickGrid'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { RACK_SIZE } from '@/features/overview/LocationsPanel'
import { cn } from '@/lib/cn'
import { formatUptime } from '@/lib/format'
import { STATUS_BG, STATUS_LABEL } from '@/lib/status'
import { regionById } from '@/mock/regions'
import type { Region, Server } from '@/mock/types'

type Props = {
  /** 필터 전 전체 목록을 리전별로 묶은 것. 랙 위치(R1 · U03)는 필터와 상관없이 이 순서로 정한다 */
  groups: { region: Region; servers: Server[] }[]
  /** 필터에 걸린 서버 id */
  visible: Set<string>
  selected: Server | null
  onSelect: (id: string | null) => void
}

const isLive = (s: Server) => s.status === 'running' || s.status === 'warning'

/**
 * 그리드 보기. 리전별로 서버를 큰 벽돌(28×20)로 깔고, 하나를 누르면 오른쪽에 요약 카드가 열린다.
 * 루트 폰트가 14px라 벽돌, 간격, 카드 폭은 시안과 같게 px로 고정한다.
 */
export function ServerBrickMap({ groups, visible, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-[32px] gap-y-[28px] rounded-lg border bg-surface p-[20px] md:grid-cols-2">
        {groups.map(({ region, servers }) => {
          const shown = servers
            .map((s, i) => ({ s, rack: Math.floor(i / RACK_SIZE) + 1, unit: (i % RACK_SIZE) + 1 }))
            .filter(({ s }) => visible.has(s.id))
          if (shown.length === 0) return null

          return (
            <section key={region.id} aria-label={region.city}>
              <div className="mb-[12px] flex items-baseline gap-[10px]">
                <Mono className="text-sm font-medium">{region.id}</Mono>
                <span className="text-xs text-ink-mute">
                  {region.city} · {shown.length} servers
                </span>
              </div>
              <ul className="flex flex-wrap gap-[6px]">
                {shown.map(({ s, rack, unit }) => {
                  const on = selected?.id === s.id
                  return (
                    <li key={s.id}>
                      <Tooltip
                        content={
                          <BrickDetail
                            b={{
                              id: s.id,
                              label: s.hostname,
                              status: s.status,
                              to: `/servers/${s.id}`,
                              rack,
                              unit,
                              cpu: isLive(s) ? s.usage.cpu : undefined,
                            }}
                          />
                        }
                      >
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`${s.hostname}, ${STATUS_LABEL[s.status]}`}
                          onClick={() => onSelect(on ? null : s.id)}
                          className={cn(
                            'block h-[20px] w-[28px] cursor-pointer rounded-[3px] outline-offset-2 transition-[outline-color] duration-150',
                            on
                              ? 'outline-2 outline-ink'
                              : 'outline-[1.5px] outline-transparent hover:outline-ink-mute',
                            STATUS_BG[s.status],
                          )}
                        />
                      </Tooltip>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {selected ? (
        <ServerSummary server={selected} />
      ) : (
        <p className="rounded-lg border border-dashed px-[16px] py-[40px] text-center text-sm text-ink-mute">
          서버를 선택하면 요약이 보입니다
        </p>
      )}
    </div>
  )
}

/** 선택한 서버의 요약. 위쪽 3px 띠가 상태 색이다 */
function ServerSummary({ server: s }: { server: Server }) {
  const live = isLive(s)
  const rows: [string, string][] = [
    ['CPU', `${s.cores} Core · ${s.cpu.model}`],
    ['Memory', `${s.memoryGB} GB`],
    ['IP', s.ip],
    ['OS', s.os ?? '—'],
    ['Uptime', formatUptime(s.uptimeSec)],
  ]

  return (
    <aside
      aria-label={`${s.hostname} 요약`}
      className="relative overflow-hidden rounded-lg border bg-raised px-[16px] pb-[16px] pt-[19px] xl:sticky xl:top-[16px]"
    >
      <span className={cn('absolute inset-x-0 top-0 h-[3px]', STATUS_BG[s.status])} />

      <div className="flex items-center justify-between gap-[8px]">
        <Mono className="truncate font-medium">{s.hostname}</Mono>
        <StatusBadge status={s.status} />
      </div>
      <p className="mt-[2px] text-xs text-ink-mute">
        {regionById[s.region].city} · {s.region}
      </p>

      <dl className="my-[14px] grid grid-cols-[64px_minmax(0,1fr)] gap-x-[8px] gap-y-[6px] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-mute">{k}</dt>
            <dd className="num truncate text-xs leading-[20px]">{v}</dd>
          </div>
        ))}
      </dl>

      {(['cpu', 'memory'] as const).map((m) => (
        <div key={m} className="mt-[8px] grid grid-cols-[56px_1fr_36px] items-center gap-[8px] text-xs">
          <span className="text-ink-mute">{m === 'cpu' ? 'CPU' : 'Memory'}</span>
          {live ? (
            <>
              <Meter value={s.usage[m]} />
              <Value value={s.usage[m]} unit="%" className="text-right font-medium" />
            </>
          ) : (
            <span className="col-span-2 text-ink-mute">—</span>
          )}
        </div>
      ))}

      <Button asChild className="mt-[16px] w-full">
        <Link to={`/servers/${s.id}`}>
          상세 보기 <ArrowRight />
        </Link>
      </Button>
    </aside>
  )
}
