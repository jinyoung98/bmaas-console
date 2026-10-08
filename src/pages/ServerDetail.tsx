import { ServerOff } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/data/EmptyState'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { HardwareTab } from '@/features/server-detail/HardwareTab'
import { MonitoringTab } from '@/features/server-detail/MonitoringTab'
import { NetworkTab } from '@/features/server-detail/NetworkTab'
import { NoticeLine } from '@/features/server-detail/NoticeLine'
import { OverviewTab } from '@/features/server-detail/OverviewTab'
import { ServerHeader } from '@/features/server-detail/ServerHeader'
import { SpecStrip } from '@/features/server-detail/SpecStrip'
import { isNoticeStatus } from '@/lib/status'
import { latestEventOf } from '@/mock/selectors'
import { serverById } from '@/mock/servers'
import type { Server } from '@/mock/types'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'network', label: 'Network' },
  { value: 'monitoring', label: 'Monitoring' },
] as const
type TabValue = (typeof TABS)[number]['value']

const DEFAULT_REASON = {
  warning: '임계값을 넘은 지표가 있습니다. 상태를 확인해 주세요.',
  error: '서버가 응답하지 않습니다.',
  maintenance: '점검 중입니다.',
} as const

/** 헤더 아래 알림 줄. 사유와 시간은 그 서버의 가장 최근 같은 severity 이벤트에서 가져온다 */
function Notice({ server: s }: { server: Server }) {
  if (!isNoticeStatus(s.status)) return null
  const e = latestEventOf(s, s.status)
  return <NoticeLine className="mt-[16px]" status={s.status} text={e?.text ?? DEFAULT_REASON[s.status]} at={e?.at} />
}

export default function ServerDetail() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const server = id ? serverById[id] : undefined

  if (!server) {
    return (
      <>
        <PageHeader breadcrumb={[{ label: 'Servers', to: '/servers' }, { label: id ?? '' }]} title="Server detail" bordered={false} />
        <div className="px-5 py-8 md:px-8">
          <EmptyState
            icon={ServerOff}
            title="서버를 찾을 수 없습니다"
            description="주소가 바뀌었거나 해제된 서버일 수 있습니다."
            action={
              <Button asChild>
                <Link to="/servers">Servers로 돌아가기</Link>
              </Button>
            }
          />
        </div>
      </>
    )
  }

  const requested = params.get('tab')
  const tab: TabValue = TABS.find((t) => t.value === requested)?.value ?? 'overview'
  // 기본 탭은 주소에 남기지 않는다. 탭을 바꾸면 기록이 쌓여 뒤로 가기로 이전 탭에 돌아간다
  const select = (v: string) => setParams(v === 'overview' ? {} : { tab: v })

  return (
    <>
      <ServerHeader server={server} />
      <div className="px-5 pb-8 md:px-8">
        <Notice server={server} />
        <SpecStrip server={server} />

        <Tabs value={tab} onValueChange={select} className="mt-[24px]">
          {/* 좁은 화면에서는 탭 줄이 이 안에서 가로로 스크롤된다 */}
          <div className="overflow-x-auto">
            <TabsList className="w-max min-w-full">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-[20px]">
            <OverviewTab key={server.id} server={server} />
          </TabsContent>
          <TabsContent value="hardware" className="mt-[20px]">
            <HardwareTab server={server} />
          </TabsContent>
          <TabsContent value="network" className="mt-[20px]">
            <NetworkTab key={server.id} server={server} />
          </TabsContent>
          <TabsContent value="monitoring" className="mt-[20px]">
            <MonitoringTab key={server.id} server={server} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
