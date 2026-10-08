import { Server as ServerIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Meter } from '@/components/data/Meter'
import { Mono } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { isLiveStatus } from '@/lib/status'
import type { Server } from '@/mock/types'

/** 2단 셀의 아랫줄. 리전 id, CPU 모델, IP처럼 윗줄을 보충하는 값 */
const sub = 'num block text-[11px] leading-4 text-ink-mute'

type HostProps = { server: Server; withStatus?: boolean; withIp?: boolean }

/**
 * 서버 아이콘 + 호스트명(상세 링크).
 * withStatus: 상태 열이 없는 짧은 표(Overview)에서 이름 옆에 배지. withIp: IP 열을 따로 두지 않는 목록(Servers)에서 이름 아래에 IP
 */
export function HostCell({ server: s, withStatus = false, withIp = false }: HostProps) {
  const name = (
    <Link to={`/servers/${s.id}`} onClick={(e) => e.stopPropagation()}>
      <Mono className="font-medium">{s.hostname}</Mono>
    </Link>
  )
  return (
    <div className="flex items-center gap-2.5">
      <ServerIcon className="size-4 shrink-0 text-ink-mute" />
      {withIp ? (
        <div>
          {name}
          <span className={sub}>{s.ip}</span>
        </div>
      ) : (
        name
      )}
      {withStatus && <StatusBadge status={s.status} />}
    </div>
  )
}

/** CPU 서버는 코어 수와 모델, GPU 서버는 GPU 구성이 먼저 오고 CPU는 아랫줄로 */
export function ComputeCell({ server: s }: { server: Server }) {
  return s.gpu ? (
    <>
      <Mono className="text-ink-soft">
        {s.gpu.count}× {s.gpu.model}
      </Mono>
      <span className={sub}>
        {s.cpu.model} · {s.cores} Core
      </span>
    </>
  ) : (
    <>
      <Mono className="text-ink-soft">{s.cores} Core</Mono>
      <span className={sub}>{s.cpu.model}</span>
    </>
  )
}

/** CPU 사용률 숫자 + 56px 막대. 막대 색 규칙은 Meter(75% warning, 90% error)를 따른다. 꺼진 서버는 — */
export function UtilizationCell({ server: s }: { server: Server }) {
  if (!isLiveStatus(s.status)) return <span className="text-ink-mute">—</span>
  return (
    <span className="flex items-center gap-[8px]">
      <Mono className="w-[32px] text-ink-soft">{s.usage.cpu}%</Mono>
      <Meter value={s.usage.cpu} className="w-[56px]" />
    </span>
  )
}
