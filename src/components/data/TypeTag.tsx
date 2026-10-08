import { cn } from '@/lib/cn'

/** 서버 유형 태그. 윤곽선 3px 라운드의 11px Mono. 서버 카드와 상세 헤더가 같이 쓴다 */
export function TypeTag({ gpu, className }: { gpu: boolean; className?: string }) {
  return (
    <span className={cn('num rounded-[3px] border border-line-strong px-[5px] text-[11px] leading-[16px] text-ink-soft', className)}>
      {gpu ? 'GPU' : 'CPU'}
    </span>
  )
}
