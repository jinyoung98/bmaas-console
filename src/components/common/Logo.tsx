import { cn } from '@/lib/cn'

/** 벽돌 두 줄을 엇갈려 쌓은 마크. 줄눈은 배경색으로 비워서 라이트/다크 모두 대응한다 */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-5', className)} aria-hidden>
      <rect x="1" y="3" width="8.5" height="6" rx="1" fill="currentColor" />
      <rect x="10.5" y="3" width="8.5" height="6" rx="1" fill="currentColor" opacity=".55" />
      <rect x="1" y="11" width="4.5" height="6" rx="1" fill="currentColor" opacity=".55" />
      <rect x="6.5" y="11" width="8.5" height="6" rx="1" fill="currentColor" />
      <rect x="16" y="11" width="3" height="6" rx="1" fill="currentColor" opacity=".55" />
    </svg>
  )
}

type Props = { className?: string; /** 좁은 화면에서는 마크만 보여준다 */ collapsible?: boolean }

export function Logo({ className, collapsible }: Props) {
  return (
    <div className={cn('flex items-center gap-2.5 text-brand', className)}>
      <Mark />
      <span className={cn('font-brand text-[19px] leading-none tracking-wide text-ink', collapsible && 'max-sm:hidden')}>
        BRICKSUM
      </span>
    </div>
  )
}
