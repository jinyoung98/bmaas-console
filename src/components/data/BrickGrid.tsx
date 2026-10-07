import { Link } from 'react-router'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, type ServerStatus } from '@/lib/status'
import { Mono } from './Mono'

export type Brick = { id: string; label: string; status: ServerStatus; to: string }

/**
 * 서버 한 대 = 벽돌 한 장. 브릭섬의 시그니처 시각화.
 * 색은 상태, 위치는 리전 안의 순서다. 마우스를 올리면 호스트명을 알려주고 누르면 상세로 간다.
 */
export function BrickGrid({ bricks, className }: { bricks: Brick[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-1', className)}>
      {bricks.map((b) => (
        <li key={b.id}>
          <Tooltip
            content={
              <span className="flex items-center gap-2">
                <Mono>{b.label}</Mono>
                <span className="opacity-70">{STATUS_LABEL[b.status]}</span>
              </span>
            }
          >
            <Link
              to={b.to}
              aria-label={`${b.label}, ${STATUS_LABEL[b.status]}`}
              className={cn(
                'block size-4 rounded-[3px] transition-[transform,box-shadow] duration-150',
                'hover:-translate-y-px hover:shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--ink-mute)]',
                STATUS_BG[b.status],
              )}
            />
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}
