export type ServerStatus = 'running' | 'available' | 'warning' | 'error' | 'maintenance'

/** 상태의 표시 순서와 이름. 스택 바, 탭, 범례가 모두 이 순서를 따른다 */
export const STATUS_ORDER: ServerStatus[] = ['running', 'available', 'maintenance', 'warning', 'error']

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

export const STATUS_TEXT: Record<ServerStatus, string> = {
  running: 'text-st-running',
  available: 'text-st-available',
  maintenance: 'text-st-maintenance',
  warning: 'text-st-warning',
  error: 'text-st-error',
}

/** 배지 배경은 상태색 12%, 글자는 상태색. 테두리 없이 틴트만으로 구분한다 */
export const STATUS_BADGE: Record<ServerStatus, string> = {
  running: 'bg-st-running/12 text-st-running',
  available: 'bg-st-available/12 text-st-available',
  maintenance: 'bg-st-maintenance/12 text-st-maintenance',
  warning: 'bg-st-warning/12 text-st-warning',
  error: 'bg-st-error/12 text-st-error',
}
