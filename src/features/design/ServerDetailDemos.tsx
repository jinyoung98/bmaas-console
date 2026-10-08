import { useState } from 'react'
import { Mono } from '@/components/data/Mono'
import { StatusIcon } from '@/components/data/StatusIcon'
import { TypeTag } from '@/components/data/TypeTag'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { NoticeLine } from '@/features/server-detail/NoticeLine'
import { OverviewTab } from '@/features/server-detail/OverviewTab'
import { ServerHeader } from '@/features/server-detail/ServerHeader'
import { SpecStrip } from '@/features/server-detail/SpecStrip'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/status'
import { serverById } from '@/mock/servers'

const NOW = Date.now()

function Label({ children }: { children: string }) {
  return <Mono className="mb-2 block text-xs text-ink-mute">{children}</Mono>
}

/** Components 층: 상태 글리프 5종을 한 줄로 */
export function StatusIconRow() {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3">
      {STATUS_ORDER.map((s) => (
        <li key={s} className="flex items-center gap-[8px] text-sm">
          <StatusIcon status={s} />
          {STATUS_LABEL[s]}
        </li>
      ))}
    </ul>
  )
}

/** Components 층: 알림 줄 3종. 사유와 시간은 서버의 최근 이벤트에서 오지만 여기서는 고정 문구 */
export function NoticeLineSamples() {
  return (
    <div className="max-w-[760px] space-y-3">
      <NoticeLine status="warning" text="CPU 온도가 82°C를 넘었습니다" at={NOW - 12 * 60_000} />
      <NoticeLine status="error" text="전원 이상으로 응답하지 않습니다" at={NOW - 25 * 60_000} />
      <NoticeLine status="maintenance" text="펌웨어 업데이트를 위해 점검 모드로 전환되었습니다" at={NOW - 300 * 60_000} />
    </div>
  )
}

/** Components 층: 스펙 띠 두 유형 */
export function SpecStripSamples() {
  return (
    <div className="space-y-6">
      <div>
        <Label>GPU 서버</Label>
        <SpecStrip server={serverById['bm-gwangju-01']} />
      </div>
      <div>
        <Label>CPU 서버</Label>
        <SpecStrip server={serverById['bm-seoul-01']} />
      </div>
    </div>
  )
}

export function TypeTagSamples() {
  return (
    <div className="flex items-center gap-3">
      <TypeTag gpu={false} />
      <TypeTag gpu />
    </div>
  )
}

const SCALE = 0.78

/**
 * Patterns 층: 서버 상세의 첫 화면. 헤더 → 알림 줄 → 스펙 띠 → 탭 → Overview 2열을 실제 컴포넌트로 그린다.
 * 화면 폭 그대로는 이 블록에 들어가지 않아 1180px 폭으로 그려 zoom으로 줄인다.
 */
export function ServerDetailPattern() {
  const [tab, setTab] = useState('overview')
  const s = serverById['bm-gwangju-01']
  return (
    <div className="overflow-x-auto rounded-lg border bg-bg">
      <div style={{ width: 1180, zoom: SCALE }}>
        <ServerHeader server={s} />
        <div className="px-8 pb-6">
          <SpecStrip server={s} />
          <Tabs value={tab} onValueChange={setTab} className="mt-[24px]">
            <TabsList>
              {['overview', 'hardware', 'network', 'monitoring'].map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="mt-[20px]">
            <OverviewTab server={s} />
          </div>
        </div>
      </div>
    </div>
  )
}
