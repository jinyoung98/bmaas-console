import type { ServerStatus } from '@/lib/status'

export type RegionId = 'kr-seoul-1' | 'kr-gwangju-1' | 'kr-busan-1' | 'jp-tokyo-1'

export type Region = {
  id: RegionId
  city: string
  /** 호스트명에 쓰는 도시 코드. bm-seoul-01 의 seoul */
  code: string
}

export type Drive = { kind: 'NVMe' | 'SSD'; sizeTB: number; count: number }

export type Gpu = { vendor: 'NVIDIA' | 'AMD'; model: string; count: number; memoryGB: number }

export type Usage = { cpu: number; memory: number; storage: number; network: number }

export type Server = {
  id: string
  hostname: string
  status: ServerStatus
  region: RegionId
  ip: string
  cpu: { vendor: 'AMD' | 'Intel'; model: string; sockets: number; coresPerSocket: number }
  /** sockets × coresPerSocket */
  cores: number
  memoryGB: number
  storage: Drive[]
  storageTB: number
  network: { ports: number; speedGbps: number }
  /** 배포 전(Available)에는 OS가 없다 */
  os: string | null
  gpu?: Gpu
  usage: Usage
  uptimeSec: number
  /** 월 이용료(원). 계약 단가라 사용률과 상관없이 고정 */
  monthlyCost: number
  createdAt: number
  updatedAt: number
}

export type ActivityEvent = {
  id: string
  /** 상태 색을 그대로 빌려 중요도를 나타낸다 */
  severity: ServerStatus
  hostname: string
  text: string
  at: number
}
