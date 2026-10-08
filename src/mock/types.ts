import type { ServerStatus } from '@/lib/status'

export type RegionId = 'kr-seoul-1' | 'kr-gwangju-1' | 'kr-busan-1' | 'jp-tokyo-1'

export type Region = {
  id: RegionId
  city: string
  /** 호스트명에 쓰는 도시 코드. bm-seoul-01 의 seoul */
  code: string
}

export type Drive = { kind: 'NVMe' | 'SSD'; sizeTB: number; count: number }

export type Gpu = {
  vendor: 'NVIDIA' | 'AMD'
  model: string
  count: number
  memoryGB: number
  /** GPU 사이를 잇는 링크. 상세 Hardware 탭에만 쓴다 */
  memoryType: string
  interconnect: string
  driver: string
}

/** GPU 한 장의 현재 사용률(%)과 사용 중인 VRAM(GB) */
export type GpuUsage = { util: number; memoryUsedGB: number }

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
  /** GPU 개수만큼. 켜져 있는(running/warning) GPU 서버에만 있다 */
  gpuUsage?: GpuUsage[]
  usage: Usage
  uptimeSec: number
  /** 월 이용료(원). 계약 단가라 사용률과 상관없이 고정 */
  monthlyCost: number
  createdAt: number
  updatedAt: number
}

/** 누가 한 일인가. user = 고객사 구성원, system = 자동 감지, provider = 브릭섬 운영팀 */
export type ActivityActor = { kind: 'user' | 'system' | 'provider'; name: string }

export type ActivityEvent = {
  id: string
  /** 상태 색을 그대로 빌려 중요도를 나타낸다 */
  severity: ServerStatus
  hostname: string
  text: string
  at: number
  actor: ActivityActor
  /** Warning·Error가 해소된 시각. 없으면 아직 조치가 필요한 이슈다(다른 심각도에는 쓰지 않는다) */
  resolvedAt?: number
}
