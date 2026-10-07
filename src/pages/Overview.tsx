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

export default function Overview() {
  return (
    <>
      <PageHeader
        eyebrow="Compute"
        title="Overview"
        description="내 인프라의 현재 상태를 한눈에 확인합니다."
        actions={
          <Button variant="primary">
            <Plus /> Create server
          </Button>
        }
      />

      <div className="grid gap-5 px-5 py-6 md:px-8">
        <FleetStatus counts={counts} regionCount={regions.length} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UtilizationPanel means={means} />
          </div>
          <LocationsPanel groups={groups} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <RecentServers servers={recent} />
          </div>
          <ActivityFeed events={events} />
        </div>
      </div>
    </>
  )
}
