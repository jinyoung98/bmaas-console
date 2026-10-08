import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { DataGrid } from '@/components/data/DataGrid/DataGrid'
import { Panel, PanelHeader } from '@/components/layout/Panel'
import { Button } from '@/components/ui/Button'
import { pickServerColumns } from '@/features/servers/serverColumns'
import type { Server } from '@/mock/types'

const columns = pickServerColumns(['hostnameWithStatus', 'location', 'cpu', 'memory', 'ip', 'updated'])

export function RecentServers({ servers }: { servers: Server[] }) {
  return (
    <Panel className="h-full">
      <PanelHeader
        title="Recent servers"
        description="최근에 변경된 서버"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/servers">
              View all <ArrowRight />
            </Link>
          </Button>
        }
      />
      <DataGrid
        data={servers}
        columns={columns}
        getRowId={(s) => s.id}
        getRowHref={(s) => `/servers/${s.id}`}
        scrollClassName="px-3 pb-1.5"
        tableClassName="min-w-[720px]"
      />
    </Panel>
  )
}
