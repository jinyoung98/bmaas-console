import { Check, Wrench, X, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/cn'
import { STATUS_TEXT, type ServerStatus } from '@/lib/status'

/*
 * 다섯 글리프가 같은 크기로 읽히도록 맞춘다(선 굵기 포함 외곽, 24 기준): X 14.6, Check 18.6×13.6, ! 높이 17,
 * 속 빈 원 11.6, Wrench 19.4. 폭이 좁은 !는 높이를, 대각선 모양인 Wrench는 외곽보다 작아 보이는 만큼을 감안했다.
 */

// lucide에 없는 두 글리프. 세로선+점, 속 빈 원
function Exclamation(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
      <path d="M12 5v9" />
      {/* 점은 선 끝 캡보다 조금 크게 채운 원으로 그려야 선과 같은 무게로 보인다 */}
      <circle cx="12" cy="19" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Ring(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  )
}

/** lucide Wrench는 24 칸을 거의 다 써서 다른 글리프보다 커 보인다. 줄인 만큼 선을 굵혀 선 무게는 같게 둔다 */
const WRENCH_SCALE = 0.86
function SmallWrench({ className, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <Wrench
      className={cn(className, 'scale-[0.86]')}
      strokeWidth={Number(strokeWidth) / WRENCH_SCALE}
      {...props}
    />
  )
}

const GLYPH: Record<ServerStatus, ComponentType<LucideProps>> = {
  running: Check,
  error: X,
  warning: Exclamation,
  available: Ring,
  maintenance: SmallWrench,
}

/** 배경은 상태색 14%를 bg와 섞은 불투명 색이라 레일이 비치지 않는다. 링은 상태색 30% */
const TINT: Record<ServerStatus, string> = {
  running: 'bg-[color-mix(in_srgb,var(--st-running)_14%,var(--bg))] border-st-running/30',
  available: 'bg-[color-mix(in_srgb,var(--st-available)_14%,var(--bg))] border-st-available/30',
  maintenance: 'bg-[color-mix(in_srgb,var(--st-maintenance)_14%,var(--bg))] border-st-maintenance/30',
  warning: 'bg-[color-mix(in_srgb,var(--st-warning)_14%,var(--bg))] border-st-warning/30',
  error: 'bg-[color-mix(in_srgb,var(--st-error)_14%,var(--bg))] border-st-error/30',
}

/**
 * 상태를 글리프 하나로 말하는 20px 틴트 링 아이콘. 타임라인 항목과 알림 줄이 같이 쓴다.
 * 루트 폰트가 14px라 rem 기반 size-5(17.5px)로는 어긋나므로 치수는 px로 고정한다.
 */
export function StatusIcon({ status, className }: { status: ServerStatus; className?: string }) {
  const Glyph = GLYPH[status]
  return (
    <span
      aria-hidden
      className={cn('grid size-[20px] shrink-0 place-items-center rounded-full border', TINT[status], STATUS_TEXT[status], className)}
    >
      <Glyph className="size-[12px]" strokeWidth={2.6} />
    </span>
  )
}
