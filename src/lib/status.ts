export type ServerStatus = 'running' | 'available' | 'warning' | 'error' | 'maintenance'

/** 상태의 표시 순서와 이름. 스택 바, 탭, 범례가 모두 이 순서를 따른다 */
export const STATUS_ORDER: ServerStatus[] = ['running', 'available', 'maintenance', 'warning', 'error']

/** 심각도 순서. 정렬에 쓴다(오름차순 = 문제 있는 서버가 위). 표시 순서인 STATUS_ORDER와 다르다 */
export const STATUS_SEVERITY: ServerStatus[] = ['error', 'warning', 'maintenance', 'available', 'running']

/** 심각도 순번. 0이 가장 심각하다 */
export const STATUS_RANK = Object.fromEntries(STATUS_SEVERITY.map((s, i) => [s, i])) as Record<ServerStatus, number>

/** 켜져 있어서 사용률을 읽을 수 있는 상태 */
export const isLiveStatus = (s: ServerStatus) => s === 'running' || s === 'warning'

export const STATUS_LABEL: Record<ServerStatus, string> = {
  running: 'Running',
  available: 'Available',
  maintenance: 'Maintenance',
  warning: 'Warning',
  error: 'Error',
}

/** Tailwind가 클래스를 정적으로 찾을 수 있게 전체 이름을 그대로 적는다 */
export const STATUS_BG: Record<ServerStatus, string> = {
  running: 'bg-st-running',
  available: 'bg-st-available',
  maintenance: 'bg-st-maintenance',
  warning: 'bg-st-warning',
  error: 'bg-st-error',
}

/** 칩 바탕과 테두리. 상태색을 옅게 물들인다(점 · 글자는 따로). 회색(Maintenance)은 옅어서 조금 더 진하게 올린다 */
export const STATUS_TINT: Record<ServerStatus, string> = {
  running: 'bg-st-running/14 border-st-running/45',
  available: 'bg-st-available/14 border-st-available/45',
  maintenance: 'bg-st-maintenance/22 border-st-maintenance/60',
  warning: 'bg-st-warning/20 border-st-warning/60',
  error: 'bg-st-error/16 border-st-error/55',
}

/** 면과 같은 상태의 더 어두운 값(strong)을 칠하는 클래스. 구성비의 Error 칸과 이슈 띠의 솔리드 머리처럼 글자 수준의 대비가 필요한 면에 쓴다 */
export const STATUS_STRONG_BG: Record<ServerStatus, string> = {
  running: 'bg-st-running-strong',
  available: 'bg-st-available-strong',
  maintenance: 'bg-st-maintenance-strong',
  warning: 'bg-st-warning-strong',
  error: 'bg-st-error-strong',
}

/** 상태색 면 위에 올리는 글자(벽돌 안 번호). 면과 같은 상태의 짝으로 대비가 맞춰져 있다 */
export const STATUS_ON: Record<ServerStatus, string> = {
  running: 'text-st-running-on',
  available: 'text-st-available-on',
  maintenance: 'text-st-maintenance-on',
  warning: 'text-st-warning-on',
  error: 'text-st-error-on',
}

export const STATUS_TEXT: Record<ServerStatus, string> = {
  running: 'text-st-running-strong',
  available: 'text-st-available-strong',
  maintenance: 'text-st-maintenance-strong',
  warning: 'text-st-warning-strong',
  error: 'text-st-error-strong',
}

/** 배지 배경은 상태색 12%, 글자는 상태색. 테두리 없이 틴트만으로 구분한다 */
export const STATUS_BADGE: Record<ServerStatus, string> = {
  running: 'bg-st-running/12 text-st-running-strong',
  available: 'bg-st-available/12 text-st-available-strong',
  maintenance: 'bg-st-maintenance/12 text-st-maintenance-strong',
  warning: 'bg-st-warning/12 text-st-warning-strong',
  error: 'bg-st-error/12 text-st-error-strong',
}

/** 헤더 아래 알림 줄이 필요한 상태 */
export type NoticeStatus = Extract<ServerStatus, 'warning' | 'error' | 'maintenance'>
export const isNoticeStatus = (s: ServerStatus): s is NoticeStatus => s === 'warning' || s === 'error' || s === 'maintenance'
