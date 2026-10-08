export type Range = '1h' | '24h' | '7d'

/** "12분 전", "3시간 전", "어제". 서비스 전체가 같은 말투를 쓰도록 한 곳에서 만든다 */
export function relativeTime(at: number, now = Date.now()) {
  const m = Math.round((now - at) / 60_000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d === 1) return '어제'
  if (d < 30) return `${d}일 전`
  return `${Math.floor(d / 30)}개월 전`
}

/** 32d 4h 처럼 가장 큰 두 단위만 */
export function formatUptime(sec: number) {
  if (sec <= 0) return '—'
  const d = Math.floor(sec / 86_400)
  const h = Math.floor((sec % 86_400) / 3_600)
  const m = Math.floor((sec % 3_600) / 60)
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** ₩1,165,000. 원 단위 정수 */
export const formatKRW = (won: number) => `₩${Math.round(won).toLocaleString('en-US')}`

const pad = (n: number) => String(n).padStart(2, '0')

/** 차트 축과 툴팁에 쓰는 시각. 7일 범위에서는 날짜를 함께 보여준다 */
export function formatClock(t: number, range: Range, withDate = false) {
  const d = new Date(t)
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return range === '7d' || withDate ? `${d.getMonth() + 1}/${d.getDate()} ${hm}` : hm
}
