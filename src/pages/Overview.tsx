import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { ActivityFeed } from '@/features/overview/ActivityFeed'
import { FleetStatus } from '@/features/overview/FleetStatus'
import { LocationsPanel } from '@/features/overview/LocationsPanel'
import { RecentServers } from '@/features/overview/RecentServers'
import { UtilizationPanel } from '@/features/overview/UtilizationPanel'
import { activity } from '@/mock/activity'
import { fleetMeans } from '@/mock/metrics'
import { regions } from '@/mock/regions'
import { groupByRegion, recentlyUpdated, statusCounts } from '@/mock/selectors'
import { servers } from '@/mock/servers'

const counts = statusCounts(servers)
const means = fleetMeans(servers)
const groups = groupByRegion(servers)
const recent = recentlyUpdated(servers, 6)
const events = activity.slice(0, 5)

/** 오른쪽 열은 고정 폭. 두 행의 오른쪽 가장자리가 같은 선에 놓이면서 비율은 대칭이 아니게 된다 */
const ROW = 'grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'

export default function Overview() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="내 인프라의 현재 상태를 한눈에 확인합니다."
        actions={
          <Button variant="primary">
            <Plus /> Create server
          </Button>
        }
      />

      {/* minmax(0,1fr): 안쪽 요소(탭, 표)가 아무리 넓어도 칸이 화면 폭 밑으로 줄어들 수 있게 한다 */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 px-5 py-7 md:px-8">
        <FleetStatus counts={counts} regionCount={regions.length} />

        <div className={ROW}>
          <UtilizationPanel means={means} />
          <LocationsPanel groups={groups} />
        </div>

        <div className={ROW}>
          <RecentServers servers={recent} />
          <ActivityFeed events={events} />
        </div>
      </div>
    </>
  )
}
