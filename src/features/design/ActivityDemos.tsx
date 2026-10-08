import { useState } from 'react'
import { DataGrid } from '@/components/data/DataGrid/DataGrid'
import { StatusIcon } from '@/components/data/StatusIcon'
import { Button } from '@/components/ui/Button'
import { ActivityDrawer } from '@/features/activity/ActivityDrawer'
import { activityGroupBy, activityGroupedColumns } from '@/features/activity/activityColumns'
import { OpenIssues } from '@/features/activity/OpenIssues'
import { STATUS_LABEL, STATUS_SEVERITY, type ServerStatus } from '@/lib/status'
import { activity } from '@/mock/activity'
import { openIssues } from '@/mock/selectors'
import type { ActivityEvent } from '@/mock/types'

/** Activity 목록의 표. 실제 화면과 같은 열을 쓰되 URL 없이 DataGrid 안에서 정렬과 페이지를 관리한다(비제어) */
export function ActivityListPattern() {
  return (
    <DataGrid
      data={activity.slice(0, 24)}
      columns={activityGroupedColumns}
      groupBy={activityGroupBy}
      getRowId={(e) => e.id}
      appearance="ruled"
      defaultSorting={[{ id: 'time', desc: true }]}
      pageSize={5}
    />
  )
}

/** 미해소 이슈 띠. 3건 이하는 목록까지 펼치고, 더 많으면 머리 한 줄로 접는다(여기서는 같은 이슈를 3배로 늘려 접힌 모양을 보인다) */
export function OpenIssuesPattern() {
  const issues = openIssues(activity)
  const many = [...issues, ...issues, ...issues]
  const [severity, setSeverity] = useState<ServerStatus | null>(null)
  return (
    <div className="grid gap-[20px]">
      <div>
        <p className="mb-[8px] text-xs text-ink-mute">1~3건: 펼침 (행을 누르면 상세 드로어)</p>
        <OpenIssues issues={issues} severity={severity} onSeverity={setSeverity} onOpen={() => {}} />
      </div>
      <div>
        <p className="mb-[8px] text-xs text-ink-mute">4건 이상: 접힘 (머리 한 줄)</p>
        <OpenIssues issues={many} severity={severity} onSeverity={setSeverity} onOpen={() => {}} />
      </div>
      <div>
        <p className="mb-[8px] text-xs text-ink-mute">Warning만 있을 때: 노랑 틴트로 한 단계 낮춤</p>
        <OpenIssues issues={issues.filter((e) => e.severity === 'warning')} severity={severity} onSeverity={setSeverity} onOpen={() => {}} />
      </div>
    </div>
  )
}

/** 상세 드로어. 실제 화면에서는 오버레이가 화면 전체를 덮지만, 여기서는 버튼으로 열어 볼 수 있게 한다 */
export function ActivityDrawerPattern() {
  const [event, setEvent] = useState<ActivityEvent | null>(null)
  // 심각도마다 이벤트 하나씩(심각한 순)
  const samples = STATUS_SEVERITY.flatMap((s) => activity.find((e) => e.severity === s) ?? [])
  return (
    <>
      <div className="flex flex-wrap gap-[8px]">
        {samples.map((e) => (
          <Button key={e.id} onClick={() => setEvent(e)}>
            <StatusIcon status={e.severity} className="size-[16px]" />
            {STATUS_LABEL[e.severity]}
          </Button>
        ))}
      </div>
      <ActivityDrawer event={event} onClose={() => setEvent(null)} />
    </>
  )
}
