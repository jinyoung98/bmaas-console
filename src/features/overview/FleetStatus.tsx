import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Mono, Value } from '@/components/data/Mono'
import { StackBar } from '@/components/data/StackBar'
import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER, type ServerStatus } from '@/lib/status'

type Props = { counts: Record<ServerStatus, number>; regionCount: number }

/**
 * 페이지의 첫 문장. 박스 없이 페이지 위에 바로 놓고, 숫자를 가장 크게 보여준다.
 * 카드 네 장이 하던 일(전체, 가동 중, 사용 가능, 이상)을 숫자 한 줄과 구성비 막대, 필터 칩으로 대신한다.
 * 루트 폰트가 14px라 rem 기반 spacing은 시안의 87.5%로 렌더링된다. 시안과 맞춰야 하는 치수는 px로 고정한다.
 */
export function FleetStatus({ counts, regionCount }: Props) {
  const total = STATUS_ORDER.reduce((s, k) => s + counts[k], 0)

  return (
    <Section className="border-b pb-7">
      <SectionHeader
        title="Fleet status"
        actions={
          <Button asChild variant="ghost" size="sm" className="-mr-2.5">
            <Link to="/servers">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="mt-[16px] flex items-baseline gap-[10px]">
        <Value value={total} className="text-3xl font-semibold tracking-tight" />
        <span className="text-sm text-ink-mute">servers · {regionCount}개 리전</span>
      </div>

      <StackBar
        showValues
        className="mb-[14px] mt-[16px] h-[32px] gap-[3px]"
        segments={STATUS_ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s], value: counts[s], className: STATUS_BG[s] }))}
      />

      <ul className="flex flex-wrap gap-[8px]">
        {STATUS_ORDER.map((s) => (
          <li key={s}>
            <Link
              to={`/servers?status=${s}`}
              className="flex h-[32px] items-center gap-[8px] rounded-sm border border-line bg-raised px-[12px] text-sm transition-colors hover:border-line-strong hover:bg-accent-subtle"
            >
              <span className={`size-[8px] rounded-[2px] ${STATUS_BG[s]}`} />
              {STATUS_LABEL[s]}
              <Value value={counts[s]} className="text-sm font-semibold" />
              <Mono className="text-xs text-ink-mute">{Math.round((counts[s] / total) * 100)}%</Mono>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
