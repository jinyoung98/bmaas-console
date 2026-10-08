import type { Server } from '@/mock/types'

export const gb = (n: number) => `${n.toLocaleString('en-US')} GB`

/** 스펙 띠의 항목. GPU 서버는 GPUs / VRAM / CPU / Memory, CPU 서버는 CPU / Memory / Storage / Network */
export function formatSpecs(s: Server): [string, string][] {
  return s.gpu
    ? [
        ['GPUs', `${s.gpu.count}× ${s.gpu.model}`],
        ['VRAM', gb(s.gpu.count * s.gpu.memoryGB)],
        ['CPU', `${s.cores} Core`],
        ['Memory', gb(s.memoryGB)],
      ]
    : [
        ['CPU', `${s.cores} Core`],
        ['Memory', gb(s.memoryGB)],
        ['Storage', `${s.storageTB} TB`],
        ['Network', `${s.network.ports}× ${s.network.speedGbps} Gbps`],
      ]
}
