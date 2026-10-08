import { Link, useNavigate } from 'react-router'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { TypeTag } from '@/components/data/TypeTag'
import { cn } from '@/lib/cn'
import { formatKRW } from '@/lib/format'
import { isLiveStatus, STATUS_BG, STATUS_LABEL, STATUS_TEXT, type ServerStatus } from '@/lib/status'
import { regionById } from '@/mock/regions'
import type { Server } from '@/mock/types'
import { ServerActionsMenu } from './ServerActionsMenu'

/** 상태 밴드: 상태색 7% 바탕 + 18% 아래 선. Tailwind가 찾을 수 있게 전체 이름을 적는다 */
const BAND: Record<ServerStatus, string> = {
  running: 'bg-st-running/7 border-st-running/18',
  available: 'bg-st-available/7 border-st-available/18',
  maintenance: 'bg-st-maintenance/7 border-st-maintenance/18',
  warning: 'bg-st-warning/7 border-st-warning/18',
  error: 'bg-st-error/7 border-st-error/18',
}

/** 켜져 있지 않은 서버는 사용률 대신 왜 비어 있는지 한 줄로 말한다 */
const IDLE_REASON: Partial<Record<ServerStatus, string>> = {
  available: '대기 중 · 바로 배포할 수 있습니다',
  maintenance: '점검 모드 · 트래픽을 받지 않습니다',
  error: '응답 없음 · 전원 또는 네트워크 확인 필요',
}

const label = 'block text-[11px] uppercase tracking-[0.04em] text-ink-mute'

/** 위 구분선 아래 3칸 스펙. CPU 서버는 Cores / Memory / Storage, GPU 서버는 GPUs / VRAM / Memory */
function specs(s: Server): [string, string][] {
  const gb = (n: number) => `${n.toLocaleString('en-US')} GB`
  return s.gpu
    ? [
        ['GPUs', `${s.gpu.count}×`],
        ['VRAM', gb(s.gpu.count * s.gpu.memoryGB)],
        ['Memory', gb(s.memoryGB)],
      ]
    : [
        ['Cores', String(s.cores)],
        ['Memory', gb(s.memoryGB)],
        ['Storage', `${s.storageTB} TB`],
      ]
}

/** 사용률 한 줄(축약형)의 색. Meter와 같은 임계값(75% warning, 90% error) */
const usageTone = (v: number) => (v >= 90 ? 'text-st-error' : v >= 75 ? 'text-st-warning' : 'text-ink-mute')

/**
 * 서버 한 대 = 카드 한 장(Grid 보기). 위에서 아래로 상태 → 이름 → 모델 → 핵심 스펙 → 사용률 → IP·월 비용.
 * 그림자 없이 1px 선과 상태색 밴드로 구분하고, 카드 전체가 상세로 가는 링크다(⋯ 메뉴 클릭은 제외).
 *
 * 그리드 영역(@container 조상)이 480px보다 좁으면 축약형이 된다: 스펙 3칸과 사용률 막대를 빼고,
 * 모델 줄 오른쪽에 CPU % 한 줄, Error만 '응답 없음' 한 줄을 남긴다. 한 마크업에서 컨테이너 쿼리 클래스로 바꾼다.
 */
export function ServerCard({ server: s, className }: { server: Server; className?: string }) {
  const navigate = useNavigate()
  const href = `/servers/${s.id}`
  const live = isLiveStatus(s.status)
  const reason = IDLE_REASON[s.status]

  return (
    <article
      onClick={() => navigate(href)}
      className={cn(
        'flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-raised transition-colors hover:border-line-strong',
        s.status === 'error' && 'border-[color-mix(in_srgb,var(--st-error)_35%,var(--line))]',
        className,
      )}
    >
      <header
        className={cn(
          'flex h-[32px] items-center justify-between gap-[8px] border-b px-[16px] @[480px]:h-[36px] @[480px]:px-[20px]',
          BAND[s.status],
        )}
      >
        <span className={cn('flex items-center gap-[8px] text-xs font-medium', STATUS_TEXT[s.status])}>
          <span className={cn('size-[6px] rounded-full', STATUS_BG[s.status])} />
          {STATUS_LABEL[s.status]}
        </span>
        <span className="flex items-center gap-[8px]">
          <span className="hidden text-xs text-ink-soft @[480px]:inline">{regionById[s.region].city}</span>
          <TypeTag gpu={!!s.gpu} />
        </span>
      </header>

      <div className="flex flex-1 flex-col px-[16px] py-[8px] @[480px]:px-[20px] @[480px]:pb-[18px] @[480px]:pt-[16px]">
        <div className="flex items-center justify-between gap-[8px]">
          {/* 키보드로도 상세에 갈 수 있게 이름은 링크로 둔다. 카드 클릭과 겹쳐 두 번 이동하지 않게 전파를 막는다 */}
          <Link to={href} onClick={(e) => e.stopPropagation()} className="min-w-0 truncate">
            <Mono className="text-base font-medium @[480px]:text-lg">{s.hostname}</Mono>
          </Link>
          {/* 축약형에서는 28px 버튼이 줄 높이를 키우지 않도록 위아래를 당긴다 */}
          <ServerActionsMenu server={s} className="-my-[4px] -mr-[6px] @[480px]:my-0" />
        </div>
        <div className="flex items-baseline justify-between gap-[8px] @[480px]:mt-[4px]">
          <p className="min-w-0 truncate text-sm font-medium @[480px]:text-base">
            {s.gpu ? (
              <>
                {s.gpu.vendor} {s.gpu.model} <span className="num text-xs font-normal text-ink-mute">×{s.gpu.count}</span>
              </>
            ) : (
              `${s.cpu.vendor} ${s.cpu.model}`
            )}
          </p>
          {/* 축약형: 막대 대신 숫자 한 줄. Error는 응답 없음만 */}
          {live ? (
            <Mono className={cn('shrink-0 text-xs @[480px]:hidden', usageTone(s.usage.cpu))}>CPU {s.usage.cpu}%</Mono>
          ) : (
            s.status === 'error' && <span className="shrink-0 text-xs text-st-error @[480px]:hidden">응답 없음</span>
          )}
        </div>
        <p className="hidden text-xs text-ink-mute @[480px]:block">
          {s.gpu ? `${s.cpu.model} · ${s.cores} Core` : `${s.cpu.sockets}× socket`}
        </p>

        <dl className="mt-[16px] hidden grid-cols-3 gap-[8px] border-t pt-[16px] @[480px]:grid">
          {specs(s).map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className={label}>{k}</dt>
              <dd className="num mt-[2px] truncate text-base font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-[16px] hidden flex-1 @[480px]:block">
          {live ? (
            <div className="space-y-[10px]">
              {(['cpu', 'memory'] as const).map((m) => (
                <div key={m} className="grid grid-cols-[56px_1fr_36px] items-center gap-[8px] text-xs">
                  <span className="text-ink-mute">{m === 'cpu' ? 'CPU' : 'Memory'}</span>
                  <Meter value={s.usage[m]} />
                  <Value value={s.usage[m]} unit="%" className="text-right font-medium" />
                </div>
              ))}
            </div>
          ) : (
            reason && (
              <p
                className={cn(
                  'rounded-sm border border-dashed px-[10px] py-[8px] text-xs',
                  s.status === 'error'
                    ? 'border-st-error/40 bg-st-error/6 text-st-error'
                    : 'border-line-strong text-ink-mute',
                )}
              >
                {reason}
              </p>
            )
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-[8px] border-t px-[16px] py-[6px] @[480px]:px-[20px] @[480px]:py-[12px]">
        <Mono className="text-xs text-ink-soft">{s.ip}</Mono>
        <span>
          <Mono className="text-sm font-medium">{formatKRW(s.monthlyCost)}</Mono>
          <span className="ml-[4px] text-[11px] text-ink-mute">/ 월</span>
        </span>
      </footer>
    </article>
  )
}
