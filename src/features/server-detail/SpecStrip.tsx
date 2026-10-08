import { formatSpecs } from './specs'
import type { Server } from '@/mock/types'

/**
 * 박스 없는 스펙 띠. 가는 선 아래에 큰 숫자를 나열하고 항목 사이는 세로선으로 나눈다(Overview의 Fleet status와 같은 방식).
 * 좁아서 줄이 바뀌면 줄 첫 항목의 선이 사라져야 한다: 항목마다 왼쪽에 (여백 + 선 + 여백)을 두고 목록을 그만큼 왼쪽으로 당겨
 * 줄 첫머리의 선만 overflow로 잘라낸다.
 */
export function SpecStrip({ server }: { server: Server }) {
  return (
    <div className="mt-[20px] overflow-hidden border-t pt-[16px]">
      <dl className="-ml-[65px] flex flex-wrap gap-y-[12px]">
        {formatSpecs(server).map(([k, v]) => (
          <div key={k} className="ml-[32px] border-l pl-[32px]">
            <dt className="text-[11px] uppercase leading-[16px] tracking-[0.06em] text-ink-mute">{k}</dt>
            <dd className="num mt-[4px] text-2xl font-semibold tracking-tight">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
