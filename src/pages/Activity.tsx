import { Download, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { DataGrid } from '@/components/data/DataGrid/DataGrid'
import { EmptyState } from '@/components/data/EmptyState'
import { Button } from '@/components/ui/Button'
import { ActivityDrawer } from '@/features/activity/ActivityDrawer'
import { OpenIssues } from '@/features/activity/OpenIssues'
import { ActivityToolbar } from '@/features/activity/ActivityToolbar'
import { activityGroupBy, activityGroupedColumns, activityListColumns } from '@/features/activity/activityColumns'
import { useActivityQuery } from '@/features/activity/useActivityQuery'
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/status'
import { activity } from '@/mock/activity'
import { filterActivity, openIssues } from '@/mock/selectors'
import type { ActivityEvent } from '@/mock/types'

const PAGE_SIZE = 15

const pad = (n: number) => String(n).padStart(2, '0')
const csvCell = (v: string) => `"${v.replaceAll('"', '""')}"`

/** 지금 보이는 필터 결과 전체를 CSV로 내려받는다(페이지와 상관없이) */
function exportCsv(events: ActivityEvent[]) {
  const header = ['time', 'severity', 'server', 'event', 'actor']
  const rows = events.map((e) => [new Date(e.at).toISOString(), e.severity, e.hostname, e.text, e.actor.name])
  const body = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
  const d = new Date()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }))
  a.download = `activity-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function ActivityPage() {
  const { q, severity, server, range, page, sort, event, update, reset } = useActivityQuery()

  // 칩의 개수는 심각도 필터만 빼고 센다. 칩을 눌렀을 때 몇 건이 나올지 미리 보인다
  const scoped = useMemo(() => filterActivity(activity, { q, server, range }), [q, server, range])
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<(typeof STATUS_ORDER)[number], number>
    for (const e of scoped) c[e.severity] += 1
    return c
  }, [scoped])
  const filtered = useMemo(() => filterActivity(scoped, { severity }), [scoped, severity])

  // 미해소 이슈는 기간·검색과 상관없이 지금 열려 있는 것 전부(서버를 골랐으면 그 서버만)
  const issues = useMemo(() => openIssues(activity.filter((e) => !server || e.hostname === server)), [server])
  const opened = event ? (activity.find((e) => e.id === event) ?? null) : null

  // 날짜 그룹은 시간순 정렬일 때만 의미가 있다. Server로 정렬하면 평평한 표로 돌아간다
  const grouped = sort[0]?.id === 'time'

  return (
    <>
      <PageHeader
        title="Activity"
        description="서버에서 일어난 모든 이벤트입니다."
        actions={
          <Button onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
            <Download /> 내보내기
          </Button>
        }
      />

      <div className="px-5 py-7 md:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-[12px]">
          <ActivityToolbar
            q={q}
            severity={severity}
            server={server}
            range={range}
            counts={counts}
            onSearch={(v) => update({ q: v }, { replace: true })}
            onSeverity={(v) => update({ severity: v })}
            onServer={(v) => update({ server: v })}
            onRange={(v) => update({ range: v })}
          />

          <OpenIssues issues={issues} severity={severity} onSeverity={(v) => update({ severity: v })} onOpen={(id) => update({ event: id })} />

          <DataGrid
            data={filtered}
            columns={grouped ? activityGroupedColumns : activityListColumns}
            groupBy={grouped ? activityGroupBy : undefined}
            onRowClick={(e) => update({ event: e.id })}
            activeRowId={opened?.id}
            getRowId={(e) => e.id}
            appearance="ruled"
            sorting={sort}
            onSortingChange={(next) => update({ sort: next })}
            pageSize={PAGE_SIZE}
            pageIndex={page - 1}
            onPageIndexChange={(p) => update({ page: p + 1 })}
            empty={
              <EmptyState
                icon={SearchX}
                title="조건에 맞는 이벤트가 없습니다"
                description={`검색어나 ${STATUS_LABEL.running} 같은 심각도, 서버, 기간 조건을 바꿔 보세요.`}
                action={<Button onClick={reset}>필터 초기화</Button>}
              />
            }
          />
        </div>
      </div>

      <ActivityDrawer event={opened} onClose={() => update({ event: null })} />
    </>
  )
}
