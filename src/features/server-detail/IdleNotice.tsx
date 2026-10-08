import { Box, ServerOff, Wrench, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { STATUS_TEXT } from '@/lib/status'
import type { Server } from '@/mock/types'

type Tone = { icon: LucideIcon; box: string; title: string; body: (s: Server) => string }

/** 켜져 있지 않은 서버는 빈 차트 대신 왜 비어 있는지 말한다. 아이콘 박스는 상태색 틴트 */
const TONE: Record<'available' | 'maintenance' | 'error', Tone> = {
  error: {
    icon: ServerOff,
    box: 'border-st-error/30 bg-st-error/10',
    title: '서버가 응답하지 않습니다',
    body: (s) => `마지막 정상 수신 ${relativeTime(s.updatedAt)}. 전원과 네트워크 상태를 확인하거나 지원팀에 문의하세요.`,
  },
  maintenance: {
    icon: Wrench,
    box: 'border-st-maintenance/30 bg-st-maintenance/10',
    title: '점검 중인 서버입니다',
    body: () => '점검이 끝나면 사용률이 다시 표시됩니다. 그동안 트래픽을 받지 않습니다.',
  },
  available: {
    icon: Box,
    box: 'border-st-available/30 bg-st-available/10',
    title: '아직 배포되지 않은 서버입니다',
    body: () => 'OS를 설치해 배포하면 사용률을 확인할 수 있습니다.',
  },
}

/** 사용률 패널 자리에 들어가는 가운데 정렬 설명 상자 */
export function IdleNotice({ server, className }: { server: Server; className?: string }) {
  const tone = TONE[server.status as keyof typeof TONE] ?? TONE.available
  const Icon = tone.icon
  return (
    <div className={cn('flex flex-col items-center rounded-lg border border-dashed px-[24px] py-[56px] text-center', className)}>
      <span className={cn('grid size-[40px] place-items-center rounded-md border', tone.box, STATUS_TEXT[server.status])}>
        <Icon className="size-[20px]" strokeWidth={1.6} />
      </span>
      <h3 className="mt-[16px] text-base font-semibold">{tone.title}</h3>
      <p className="mt-[4px] max-w-[420px] text-sm text-ink-soft">{tone.body(server)}</p>
      {server.status === 'error' && (
        <Button className="mt-[20px]" onClick={() => toast('지원팀에 문의를 접수했습니다')}>
          지원팀에 문의
        </Button>
      )}
    </div>
  )
}
