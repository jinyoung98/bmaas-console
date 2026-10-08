import { Server as ServerIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Mono } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import type { Server } from '@/mock/types'

/** 서버 아이콘 + 호스트명(상세 링크). Overview처럼 상태 열이 없는 표에서는 배지를 옆에 붙인다 */
export function HostCell({ server: s, withStatus = false }: { server: Server; withStatus?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <ServerIcon className="size-4 shrink-0 text-ink-mute" />
      <Link to={`/servers/${s.id}`} onClick={(e) => e.stopPropagation()}>
        <Mono className="font-medium">{s.hostname}</Mono>
      </Link>
      {withStatus && <StatusBadge status={s.status} />}
    </div>
  )
}
