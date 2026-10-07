import type { ServerStatus } from '@/lib/status'
import { regionById } from './regions'
import type { Drive, Gpu, RegionId, Server, Usage } from './types'

/* ---------- 결정적 난수: 새로고침해도 같은 데이터가 나온다 ---------- */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const between = (rnd: () => number, min: number, max: number) => Math.round(min + rnd() * (max - min))

/* ---------- 스펙 프리셋 ---------- */
type Preset = {
  cpu: Server['cpu']
  memoryGB: number
  storage: Drive[]
  network: Server['network']
  gpu?: Gpu
}

const PRESETS = {
  'general-a': {
    cpu: { vendor: 'AMD', model: 'EPYC 9354', sockets: 2, coresPerSocket: 32 },
    memoryGB: 256,
    storage: [{ kind: 'NVMe', sizeTB: 1.92, count: 2 }],
    network: { ports: 2, speedGbps: 25 },
  },
  'general-b': {
    cpu: { vendor: 'Intel', model: 'Xeon Gold 6430', sockets: 2, coresPerSocket: 32 },
    memoryGB: 256,
    storage: [{ kind: 'NVMe', sizeTB: 1.92, count: 2 }],
    network: { ports: 2, speedGbps: 25 },
  },
  memory: {
    cpu: { vendor: 'AMD', model: 'EPYC 9654', sockets: 2, coresPerSocket: 96 },
    memoryGB: 1024,
    storage: [{ kind: 'NVMe', sizeTB: 3.84, count: 4 }],
    network: { ports: 2, speedGbps: 100 },
  },
  storage: {
    cpu: { vendor: 'Intel', model: 'Xeon Gold 6430', sockets: 2, coresPerSocket: 32 },
    memoryGB: 512,
    storage: [
      { kind: 'SSD', sizeTB: 0.96, count: 2 },
      { kind: 'NVMe', sizeTB: 7.68, count: 8 },
    ],
    network: { ports: 2, speedGbps: 25 },
  },
  'compute-hi': {
    cpu: { vendor: 'Intel', model: 'Xeon Platinum 8480+', sockets: 2, coresPerSocket: 56 },
    memoryGB: 512,
    storage: [{ kind: 'NVMe', sizeTB: 3.84, count: 4 }],
    network: { ports: 2, speedGbps: 100 },
  },
  'gpu-h200': {
    cpu: { vendor: 'Intel', model: 'Xeon Platinum 8480+', sockets: 2, coresPerSocket: 56 },
    memoryGB: 2048,
    storage: [{ kind: 'NVMe', sizeTB: 3.84, count: 8 }],
    network: { ports: 2, speedGbps: 400 },
    gpu: { vendor: 'NVIDIA', model: 'H200', count: 8, memoryGB: 141 },
  },
  'gpu-mi300x': {
    cpu: { vendor: 'AMD', model: 'EPYC 9654', sockets: 2, coresPerSocket: 96 },
    memoryGB: 1536,
    storage: [{ kind: 'NVMe', sizeTB: 3.84, count: 8 }],
    network: { ports: 2, speedGbps: 400 },
    gpu: { vendor: 'AMD', model: 'MI300X', count: 8, memoryGB: 192 },
  },
  'gpu-l40s': {
    cpu: { vendor: 'AMD', model: 'EPYC 9354', sockets: 2, coresPerSocket: 32 },
    memoryGB: 512,
    storage: [{ kind: 'NVMe', sizeTB: 3.84, count: 2 }],
    network: { ports: 2, speedGbps: 100 },
    gpu: { vendor: 'NVIDIA', model: 'L40S', count: 4, memoryGB: 48 },
  },
} satisfies Record<string, Preset>

type PresetKey = keyof typeof PRESETS

/** 리전별 구성. 합계 48대 */
const LAYOUT: Record<RegionId, [PresetKey, number][]> = {
  'kr-seoul-1': [['general-a', 6], ['general-b', 4], ['memory', 2], ['gpu-l40s', 3], ['storage', 1]],
  'kr-gwangju-1': [['gpu-h200', 4], ['gpu-mi300x', 2], ['general-a', 3], ['compute-hi', 3], ['storage', 2]],
  'kr-busan-1': [['general-b', 4], ['general-a', 2], ['storage', 2]],
  'jp-tokyo-1': [['gpu-h200', 2], ['general-a', 3], ['general-b', 2], ['memory', 1], ['compute-hi', 2]],
}

const IP_BASE: Record<RegionId, number> = { 'kr-seoul-1': 20, 'kr-gwangju-1': 30, 'kr-busan-1': 40, 'jp-tokyo-1': 50 }

/** 운영 중인 서비스처럼 보이도록 몇 대에 이야기를 심어 둔다 */
const STATUS_OVERRIDE: Record<string, ServerStatus> = {
  'bm-seoul-03': 'warning',
  'bm-gwangju-07': 'warning',
  'bm-tokyo-04': 'error',
  'bm-busan-05': 'maintenance',
  'bm-gwangju-12': 'maintenance',
  'bm-seoul-14': 'available',
  'bm-seoul-15': 'available',
  'bm-seoul-16': 'available',
  'bm-gwangju-13': 'available',
  'bm-gwangju-14': 'available',
  'bm-busan-08': 'available',
  'bm-tokyo-10': 'available',
}
const UPDATED_MINUTES_AGO: Record<string, number> = {
  'bm-seoul-03': 12,
  'bm-tokyo-04': 25,
  'bm-busan-02': 60,
  'bm-seoul-14': 180,
  'bm-gwangju-12': 300,
}
const UPTIME_OVERRIDE: Record<string, number> = { 'bm-busan-02': 3300 }

const OS_GENERAL = ['Ubuntu 24.04 LTS', 'Ubuntu 22.04 LTS', 'Rocky Linux 9', 'Debian 12', 'RHEL 9']
const OS_GPU = ['Ubuntu 22.04 LTS', 'Ubuntu 24.04 LTS']

const NOW = Date.now()
const DAY = 86_400_000
const pad = (n: number) => String(n).padStart(2, '0')

function usageFor(status: ServerStatus, gpu: boolean, rnd: () => number): Usage {
  if (status === 'running') {
    return {
      cpu: gpu ? between(rnd, 45, 90) : between(rnd, 22, 82),
      memory: between(rnd, 30, 86),
      storage: between(rnd, 18, 78),
      network: between(rnd, 6, 55),
    }
  }
  if (status === 'warning') return { cpu: 92, memory: 84, storage: between(rnd, 40, 80), network: between(rnd, 20, 60) }
  if (status === 'maintenance') return { cpu: 0, memory: 0, storage: between(rnd, 18, 78), network: 0 }
  return { cpu: 0, memory: 0, storage: 0, network: 0 }
}

function build(): Server[] {
  const out: Server[] = []
  let seed = 7

  for (const [regionId, groups] of Object.entries(LAYOUT) as [RegionId, [PresetKey, number][]][]) {
    const code = regionById[regionId].code
    let n = 0

    for (const [key, count] of groups) {
      for (let i = 0; i < count; i++) {
        n += 1
        const rnd = mulberry32(seed++)
        const preset: Preset = PRESETS[key]
        const hostname = `bm-${code}-${pad(n)}`
        const status = STATUS_OVERRIDE[hostname] ?? 'running'
        const live = status === 'running' || status === 'warning'

        const uptimeSec = UPTIME_OVERRIDE[hostname] ?? (live ? between(rnd, 3, 140) * 86_400 + between(rnd, 0, 86_399) : 0)
        const updatedAt =
          hostname in UPDATED_MINUTES_AGO ? NOW - UPDATED_MINUTES_AGO[hostname] * 60_000 : NOW - between(rnd, 1, 30) * DAY - between(rnd, 0, 80_000_000)
        const osPool = preset.gpu ? OS_GPU : OS_GENERAL
        const storageTB = +preset.storage.reduce((s, d) => s + d.sizeTB * d.count, 0).toFixed(2)

        out.push({
          id: hostname,
          hostname,
          status,
          region: regionId,
          ip: `10.${IP_BASE[regionId]}.${Math.ceil(n / 8)}.${10 + n}`,
          cpu: preset.cpu,
          cores: preset.cpu.sockets * preset.cpu.coresPerSocket,
          memoryGB: preset.memoryGB,
          storage: preset.storage,
          storageTB,
          network: preset.network,
          os: status === 'available' ? null : osPool[between(rnd, 0, osPool.length - 1)],
          gpu: preset.gpu,
          usage: usageFor(status, !!preset.gpu, rnd),
          uptimeSec,
          createdAt: NOW - uptimeSec * 1000 - between(rnd, 5, 200) * DAY,
          updatedAt,
        })
      }
    }
  }
  return out
}

export const servers: Server[] = build()
export const serverById = Object.fromEntries(servers.map((s) => [s.id, s])) as Record<string, Server>
