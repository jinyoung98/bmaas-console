import { ServerActionsMenu } from '@/features/servers/ServerActionsMenu'
import { ServerCard } from '@/features/servers/ServerCard'
import { ComputeCell, UtilizationCell } from '@/features/servers/ServerCells'
import { useState } from 'react'
import { Pagination } from '@/components/data/DataGrid/Pagination'
import { Mono } from '@/components/data/Mono'
import { formatKRW } from '@/lib/format'
import { serverById, servers } from '@/mock/servers'

/** 상태 5종과 CPU/GPU 두 유형이 모두 보이도록 고른 여섯 대 */
const VARIANTS = [
  ['running · GPU', 'bm-gwangju-01'],
  ['running · CPU', 'bm-seoul-01'],
  ['warning', 'bm-seoul-03'],
  ['error', 'bm-tokyo-04'],
  ['available · GPU', 'bm-seoul-14'],
  ['maintenance', 'bm-gwangju-12'],
] as const

function Label({ children }: { children: string }) {
  return <Mono className="mb-2 block text-xs text-ink-mute">{children}</Mono>
}

/** Components 층: Server card 변형. 넓은 영역의 풀 카드 6종 + 좁은 영역(480px 미만)의 축약형 */
export function ServerCardVariants() {
  return (
    <div className="space-y-8">
      <div className="@container">
        <ul className="grid grid-cols-1 gap-[16px] @[640px]:grid-cols-2 @[960px]:grid-cols-3">
          {VARIANTS.map(([label, id]) => (
            <li key={id} className="flex flex-col">
              <Label>{label}</Label>
              <ServerCard server={serverById[id]} className="flex-1" />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Label>좁은 폭(축약형) · 그리드 영역 480px 미만, 여기서는 360px 상자</Label>
        <div className="@container max-w-[360px]">
          <ul className="grid gap-[12px]">
            {VARIANTS.map(([, id]) => (
              <li key={id}>
                <ServerCard server={serverById[id]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const cellSamples = ['bm-seoul-01', 'bm-gwangju-01', 'bm-seoul-03', 'bm-tokyo-04'].map((id) => serverById[id])

/** Components 층: 행 메뉴와 Servers 표에만 있는 셀 */
export function ServerCellSamples() {
  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
      <div>
        <Label>행 메뉴 ⋯</Label>
        <div className="flex items-center gap-[12px] text-sm text-ink-soft">
          <ServerActionsMenu server={servers[0]} />
          재부팅 / OS 재설치 / 콘솔 접속 / 전원 끄기 / 서버 해제
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-mute">
              <th className="pb-2 pr-8 font-medium">Compute</th>
              <th className="pb-2 pr-8 font-medium">Utilization</th>
              <th className="pb-2 text-right font-medium">Monthly cost</th>
            </tr>
          </thead>
          <tbody>
            {cellSamples.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="whitespace-nowrap py-2 pr-8">
                  <ComputeCell server={s} />
                </td>
                <td className="py-2 pr-8">
                  <UtilizationCell server={s} />
                </td>
                <td className="py-2 text-right">
                  <Mono>{formatKRW(s.monthlyCost)}</Mono>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Patterns 층: 카드 그리드 + 페이지 */
export function ServersGridPattern() {
  const [page, setPage] = useState(0)
  return (
    <div className="@container">
      <ul className="grid grid-cols-1 gap-[16px] @[640px]:grid-cols-2 @[960px]:grid-cols-3">
        {servers.slice(page * 6, page * 6 + 6).map((s) => (
          <li key={s.id} className="flex">
            <ServerCard server={s} className="flex-1" />
          </li>
        ))}
      </ul>
      <Pagination className="mt-[16px]" pageIndex={page} pageSize={6} total={servers.length} onPageChange={setPage} />
    </div>
  )
}
