import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Mono } from '@/components/data/Mono'
import { StatusBadge } from '@/components/data/StatusDot'
import { TypeTag } from '@/components/data/TypeTag'
import { Button } from '@/components/ui/Button'
import { ServerActionsMenu } from '@/features/servers/ServerActionsMenu'
import { daysSince } from '@/lib/format'
import { regionById } from '@/mock/regions'
import type { Server } from '@/mock/types'

/** 호스트명 + 상태 + 유형, 보조 줄, 오른쪽 조작. 동작은 mock이라 요청 알림만 띄운다 */
export function ServerHeader({ server: s }: { server: Server }) {
  const parts = [regionById[s.region].city, s.ip, s.os ?? 'OS 미설치', `생성 ${daysSince(s.createdAt)}일 전`]
  return (
    <PageHeader
      bordered={false}
      mono
      breadcrumb={[{ label: 'Servers', to: '/servers' }, { label: s.hostname }]}
      title={s.hostname}
      titleAside={
        <>
          <StatusBadge status={s.status} />
          <TypeTag gpu={!!s.gpu} />
        </>
      }
      meta={
        <p className="mt-[4px] text-[13px] text-ink-mute">
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-[6px] opacity-60">·</span>}
              {p === s.ip ? <Mono>{p}</Mono> : p}
            </span>
          ))}
        </p>
      }
      actions={
        <>
          <Button onClick={() => toast(`${s.hostname} 콘솔 접속을 요청했습니다`)}>콘솔 접속</Button>
          <Button onClick={() => toast(`${s.hostname} 재부팅을 요청했습니다`)}>재부팅</Button>
          <ServerActionsMenu server={s} className="size-[32px] border border-line-strong bg-raised" />
        </>
      }
    />
  )
}
