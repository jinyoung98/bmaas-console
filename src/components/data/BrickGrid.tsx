import { Link } from 'react-router'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, type ServerStatus } from '@/lib/status'
import { Mono } from './Mono'
import { StatusDot } from './StatusDot'

export type Brick = {
  id: string
  label: string
  status: ServerStatus
  to: string
  /** 1부터 시작하는 랙 번호와 랙 안에서의 위치 */
  rack: number
  unit: number
  /** 켜져 있는 서버만 값이 있다 */
  cpu?: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 벽돌 툴팁 내용. Servers 그리드 보기의 큰 벽돌도 같은 내용을 보여준다 */
export function BrickDetail({ b }: { b: Brick }) {
  return (
    <div className="space-y-1">
      <Mono className="block font-medium">{b.label}</Mono>
      <span className="flex items-center gap-1.5 opacity-80">
        <StatusDot status={b.status} />
        {STATUS_LABEL[b.status]}
      </span>
      <Mono className="block opacity-70">
        R{b.rack} · U{pad(b.unit)}
        {b.cpu !== undefined && ` · CPU ${b.cpu}%`}
      </Mono>
    </div>
  )
}

/**
 * 서버 한 대 = 벽돌 한 장. 브릭섬의 시그니처 시각화.
 * 벽돌은 직사각형이고, 같은 랙의 서버끼리 묶여 있어서 실제 fleet의 배치처럼 읽힌다.
 * 마우스를 올리면 호스트명, 상태, 랙 위치, CPU 사용률을 알려주고, 누르면 상세로 간다.
 * 루트 폰트가 14px라 벽돌(16px)과 간격(벽돌 3px, 랙 10px, 줄 6px)은 px로 고정한다.
 */
export function BrickGrid({ bricks, className }: { bricks: Brick[]; className?: string }) {
  const racks = new Map<number, Brick[]>()
  for (const b of bricks) racks.set(b.rack, [...(racks.get(b.rack) ?? []), b])

  return (
    <div className={cn('flex flex-wrap gap-x-[10px] gap-y-[6px]', className)}>
      {[...racks.entries()].map(([rack, items]) => (
        <ul key={rack} className="flex gap-[3px]" aria-label={`랙 ${rack}`}>
          {items.map((b) => (
            <li key={b.id}>
              <Tooltip content={<BrickDetail b={b} />}>
                <Link
                  to={b.to}
                  aria-label={`${b.label}, ${STATUS_LABEL[b.status]}`}
                  className={cn(
                    'block size-[16px] rounded-[3px] transition-[transform,outline-color] duration-150',
                    // 그림자 대신 outline으로 2px 띄운 1.5px 링을 그린다
                    'outline-[1.5px] outline-offset-2 outline-transparent hover:-translate-y-px hover:outline-ink-mute',
                    STATUS_BG[b.status],
                  )}
                />
              </Tooltip>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
