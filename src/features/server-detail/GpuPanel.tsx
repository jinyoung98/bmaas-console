import { Meter } from '@/components/data/Meter'
import { Mono } from '@/components/data/Mono'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import type { Server } from '@/mock/types'

/** GPU 카드 그리드(4열, 모바일 2열). 사용률 막대는 Meter와 같은 임계값(75% warning, 90% error) */
export function GpuPanel({ server: s }: { server: Server }) {
  if (!s.gpu || !s.gpuUsage) return null
  return (
    <Panel>
      <PanelHeader title="GPU" description={`${s.gpu.count}× ${s.gpu.vendor} ${s.gpu.model} · ${s.gpu.memoryGB} GB ${s.gpu.memoryType}`} />
      <ul className="grid grid-cols-2 gap-[12px] p-[16px] md:grid-cols-4">
        {s.gpuUsage.map((g, i) => (
          <li key={i} className="rounded-md border bg-raised p-[12px]">
            <Mono className="block text-xs text-ink-mute">GPU {i}</Mono>
            <Mono className="mt-[2px] block text-base font-semibold">{g.util}%</Mono>
            <Meter value={g.util} className="mt-[8px] h-[4px]" />
            <Mono className="mt-[8px] block text-xs text-ink-mute">
              {g.memoryUsedGB} / {s.gpu!.memoryGB} GB
            </Mono>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
