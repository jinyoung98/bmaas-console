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

export const STATUS_SOFT: Record<ServerStatus, string> = {
  running: 'bg-st-running/10 text-st-running border-st-running/25',
  available: 'bg-st-available/10 text-st-available border-st-available/25',
  maintenance: 'bg-st-maintenance/10 text-st-maintenance border-st-maintenance/25',
  warning: 'bg-st-warning/10 text-st-warning border-st-warning/25',
  error: 'bg-st-error/10 text-st-error border-st-error/25',
}
