import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Eyebrow } from '@/components/common/Eyebrow'
import { Mono, Value } from '@/components/data/Mono'
import { StackBar } from '@/components/data/StackBar'
import { StatusDot } from '@/components/data/StatusDot'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER, type ServerStatus } from '@/lib/status'

type Props = { counts: Record<ServerStatus, number>; regionCount: number }

/** 카드 네 장이 하던 일(전체, 가동 중, 사용 가능, 이상)을 막대 하나와 숫자 한 줄로 대신한다 */
export function FleetStatus({ counts, regionCount }: Props) {
  const total = STATUS_ORDER.reduce((s, k) => s + counts[k], 0)

  return (
    <Panel>
      <PanelHeader
        title="Fleet status"
        description="전체 베어메탈 서버의 현재 상태"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/servers">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <PanelBody className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-center">
        <div>
          <Eyebrow>Total servers</Eyebrow>
          <div className="mt-2 flex items-baseline gap-2">
            <Value value={total} className="text-3xl font-semibold tracking-tight" />
            <span className="text-sm text-ink-mute">{regionCount}개 리전</span>
          </div>
        </div>

        <div className="space-y-5">
          <StackBar
            className="h-2.5"
            segments={STATUS_ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s], value: counts[s], className: STATUS_BG[s] }))}
          />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            {STATUS_ORDER.map((s) => (
              <li key={s}>
                <Link to={`/servers?status=${s}`} className="group block rounded-sm outline-offset-4">
                  <span className="flex items-center gap-2 text-xs text-ink-mute transition-colors group-hover:text-ink">
                    <StatusDot status={s} />
                    {STATUS_LABEL[s]}
                  </span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <Value value={counts[s]} className="text-xl font-semibold" />
                    <Mono className="text-xs text-ink-mute">{Math.round((counts[s] / total) * 100)}%</Mono>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PanelBody>
    </Panel>
  )
}
