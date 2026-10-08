import { servers } from './servers'
import type { ActivityActor, ActivityEvent } from './types'

const NOW = Date.now()
const min = (m: number) => NOW - m * 60_000

const USERS = ['jinyoung@acme.co', 'minho@acme.co', 'sora@acme.co']
const user = (i: number): ActivityActor => ({ kind: 'user', name: USERS[i % USERS.length] })
const system: ActivityActor = { kind: 'system', name: '시스템' }
const provider: ActivityActor = { kind: 'provider', name: '브릭섬 운영팀' }

/** 최신순. 앞의 10건은 Overview의 Recent activity가 그대로 쓰므로 내용과 순서를 바꾸지 않는다 */
const head: ActivityEvent[] = [
  { id: 'a1', severity: 'warning', hostname: 'bm-seoul-03', text: 'CPU 온도가 82°C를 넘었습니다', at: min(12), actor: system },
  { id: 'a2', severity: 'error', hostname: 'bm-tokyo-04', text: '전원 이상으로 응답하지 않습니다', at: min(25), actor: system },
  { id: 'a3', severity: 'running', hostname: 'bm-busan-02', text: '배포가 완료되었습니다', at: min(60), actor: user(0) },
  { id: 'a4', severity: 'available', hostname: 'bm-seoul-14', text: '서버가 해제되어 사용 가능 상태가 되었습니다', at: min(180), actor: user(1) },
  { id: 'a5', severity: 'maintenance', hostname: 'bm-gwangju-12', text: '펌웨어 업데이트를 위해 점검 모드로 전환되었습니다', at: min(300), actor: provider },
  { id: 'a6', severity: 'running', hostname: 'bm-gwangju-03', text: '재부팅이 완료되었습니다', at: min(480), actor: user(2) },
  { id: 'a7', severity: 'warning', hostname: 'bm-gwangju-07', text: 'NVMe 드라이브 수명이 15% 남았습니다', at: min(60 * 26), actor: system },
  { id: 'a8', severity: 'running', hostname: 'bm-seoul-08', text: 'Ubuntu 24.04 LTS로 OS가 재설치되었습니다', at: min(60 * 30), actor: user(0) },
  { id: 'a9', severity: 'maintenance', hostname: 'bm-busan-05', text: '네트워크 장비 교체를 위해 점검 모드로 전환되었습니다', at: min(60 * 52), actor: provider },
  { id: 'a10', severity: 'available', hostname: 'bm-seoul-15', text: '서버가 해제되어 사용 가능 상태가 되었습니다', at: min(60 * 70), actor: user(1) },
]

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

type Template = { severity: ActivityEvent['severity']; text: string; actor: 'user' | 'system' | 'provider'; weight: number; gpuOnly?: boolean }

const TEMPLATES: Template[] = [
  { severity: 'running', text: '재부팅이 완료되었습니다', actor: 'user', weight: 5 },
  { severity: 'running', text: '배포가 완료되었습니다', actor: 'user', weight: 5 },
  { severity: 'running', text: 'SSH 키가 등록되었습니다', actor: 'user', weight: 3 },
  { severity: 'running', text: '점검이 끝나 정상 운영으로 돌아왔습니다', actor: 'provider', weight: 3 },
  { severity: 'available', text: '서버가 해제되어 사용 가능 상태가 되었습니다', actor: 'user', weight: 3 },
  { severity: 'warning', text: '디스크 사용률이 85%를 넘었습니다', actor: 'system', weight: 3 },
  { severity: 'warning', text: '네트워크 지연이 감지되었습니다', actor: 'system', weight: 3 },
  { severity: 'warning', text: 'CPU 온도가 82°C를 넘었습니다', actor: 'system', weight: 2 },
  { severity: 'warning', text: 'GPU 온도가 85°C를 넘었습니다', actor: 'system', weight: 3, gpuOnly: true },
  { severity: 'error', text: '헬스 체크에 실패했습니다', actor: 'system', weight: 1 },
  { severity: 'maintenance', text: '펌웨어 업데이트를 위해 점검 모드로 전환되었습니다', actor: 'provider', weight: 2 },
]

/** 최근 30일에 걸친 시안용 이벤트. 서버와 시각은 고정 시드라서 새로고침해도 같다 */
function generate(count: number): ActivityEvent[] {
  const rnd = mulberry32(20261008)
  const from = 60 * 72
  const to = 60 * 24 * 30
  return Array.from({ length: count }, (_, i) => {
    const server = servers[Math.floor(rnd() * servers.length)]
    const pool = TEMPLATES.filter((t) => !t.gpuOnly || server.gpu)
    let pick = rnd() * pool.reduce((sum, t) => sum + t.weight, 0)
    const tpl = pool.find((t) => (pick -= t.weight) < 0) ?? pool[0]
    const actor = tpl.actor === 'user' ? user(Math.floor(rnd() * 3)) : tpl.actor === 'provider' ? provider : system
    const at = min(from + ((i + rnd()) * (to - from)) / count)
    const flagged = tpl.severity === 'warning' || tpl.severity === 'error'
    return {
      id: `a${head.length + i + 1}`,
      severity: tpl.severity,
      hostname: server.hostname,
      text: tpl.text,
      at,
      actor,
      // 3일보다 오래된 이슈는 모두 해소된 것으로 둔다. 난수를 더 쓰면 위 데이터가 달라지므로 i로만 정한다
      resolvedAt: flagged ? at + (15 + ((i * 37) % 150)) * 60_000 : undefined,
    }
  })
}

export const activity: ActivityEvent[] = [...head, ...generate(110)]
