import type { ActivityEvent } from './types'

const NOW = Date.now()
const min = (m: number) => NOW - m * 60_000

/** 최신순 */
export const activity: ActivityEvent[] = [
  { id: 'a1', severity: 'warning', hostname: 'bm-seoul-03', text: 'CPU 온도가 82°C를 넘었습니다', at: min(12) },
  { id: 'a2', severity: 'error', hostname: 'bm-tokyo-04', text: '전원 이상으로 응답하지 않습니다', at: min(25) },
  { id: 'a3', severity: 'running', hostname: 'bm-busan-02', text: '배포가 완료되었습니다', at: min(60) },
  { id: 'a4', severity: 'available', hostname: 'bm-seoul-14', text: '서버가 해제되어 사용 가능 상태가 되었습니다', at: min(180) },
  { id: 'a5', severity: 'maintenance', hostname: 'bm-gwangju-12', text: '펌웨어 업데이트를 위해 점검 모드로 전환되었습니다', at: min(300) },
  { id: 'a6', severity: 'running', hostname: 'bm-gwangju-03', text: '재부팅이 완료되었습니다', at: min(480) },
  { id: 'a7', severity: 'warning', hostname: 'bm-gwangju-07', text: 'NVMe 드라이브 수명이 15% 남았습니다', at: min(60 * 26) },
  { id: 'a8', severity: 'running', hostname: 'bm-seoul-08', text: 'Ubuntu 24.04 LTS로 OS가 재설치되었습니다', at: min(60 * 30) },
  { id: 'a9', severity: 'maintenance', hostname: 'bm-busan-05', text: '네트워크 장비 교체를 위해 점검 모드로 전환되었습니다', at: min(60 * 52) },
  { id: 'a10', severity: 'available', hostname: 'bm-seoul-15', text: '서버가 해제되어 사용 가능 상태가 되었습니다', at: min(60 * 70) },
]
