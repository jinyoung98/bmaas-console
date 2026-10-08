import { Inbox, LayoutGrid, List, Plus, RotateCw, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { BrickGrid } from '@/components/data/BrickGrid'
import { EmptyState } from '@/components/data/EmptyState'
import { KeyValueList } from '@/components/data/KeyValueList'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Meter } from '@/components/data/Meter'
import { Mono, Value } from '@/components/data/Mono'
import { Sparkline } from '@/components/data/Sparkline'
import { StackBar } from '@/components/data/StackBar'
import { StatusBadge, StatusDot } from '@/components/data/StatusDot'
import { Eyebrow } from '@/components/common/Eyebrow'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel, PanelBody, PanelHeader } from '@/components/layout/Panel'
import { Section, SectionHeader } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Kbd } from '@/components/ui/Kbd'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { ActivityFeed } from '@/features/overview/ActivityFeed'
import { ActivityDrawerPattern, ActivityListPattern, OpenIssuesPattern } from '@/features/design/ActivityDemos'
import { DataGridVariants, ServersListPattern } from '@/features/design/DataGridDemos'
import { NoticeLineSamples, ServerDetailPattern, SpecStripSamples, StatusIconRow, TypeTagSamples } from '@/features/design/ServerDetailDemos'
import { DesignBlockMenu, DesignToc } from '@/features/design/DesignNav'
import { MENU_H, scrollToBlock, slugify, TABS_H, useActiveBlock } from '@/features/design/navigation'
import { ServerCardVariants, ServerCellSamples, ServersGridPattern } from '@/features/design/ServerDemos'
import { FleetStatus } from '@/features/overview/FleetStatus'
import { LocationsPanel, RACK_SIZE } from '@/features/overview/LocationsPanel'
import { RecentServers } from '@/features/overview/RecentServers'
import { cn } from '@/lib/cn'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER } from '@/lib/status'
import { activity } from '@/mock/activity'
import { regions } from '@/mock/regions'
import { groupByRegion, recentlyUpdated, statusCounts } from '@/mock/selectors'
import { servers } from '@/mock/servers'

const surfaces = [
  ['bg', 'bg-bg'],
  ['surface', 'bg-surface'],
  ['raised', 'bg-raised'],
  ['sunken', 'bg-sunken'],
  ['accent', 'bg-accent'],
  ['brand', 'bg-brand'],
  ['accent-subtle', 'bg-accent-subtle'],
]

// 샘플은 Overview와 같은 mock과 같은 컴포넌트를 쓴다. 이 페이지만을 위한 마크업은 두지 않는다
const counts = statusCounts(servers)
const recent = recentlyUpdated(servers, 6)
const events = activity.slice(0, 5)
const groups = groupByRegion(servers)
const firstRegion = groups[0]
const bricks = firstRegion.servers.map((s, i) => ({
  id: s.id,
  label: s.hostname,
  status: s.status,
  to: `/servers/${s.id}`,
  rack: Math.floor(i / RACK_SIZE) + 1,
  unit: (i % RACK_SIZE) + 1,
  cpu: s.status === 'running' || s.status === 'warning' ? s.usage.cpu : undefined,
}))
// 상태별 벽돌 한 장씩. 범례처럼 쓰려고 상태마다 그 상태의 첫 서버를 고른다
const legendBricks = STATUS_ORDER.flatMap((status, i) => {
  const s = servers.find((x) => x.status === status)
  return s ? [{ id: s.id, label: s.hostname, status, to: `/servers/${s.id}`, rack: 1, unit: i + 1 }] : []
})
const stackSegments = STATUS_ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s], value: counts[s], className: STATUS_BG[s] }))

const trend = [32, 36, 34, 41, 39, 47, 52, 49, 58, 55, 63, 61, 68, 64, 72]

/** 토큰 → 컴포넌트 → 패턴 층을 나누는 제목 */
function LayerHeader({ title, note }: { title: string; note: string }) {
  return (
    <header className="border-b bg-surface px-5 pb-5 pt-10 md:px-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{note}</p>
    </header>
  )
}

function Block({ id, title, note, flash, children }: { id: string; title: string; note?: string; flash?: boolean; children: ReactNode }) {
  return (
    // 앵커로 이동할 때 sticky 탭(과 xl 미만의 선택 메뉴)에 제목이 가려지지 않도록 scroll-margin을 둔다
    <section id={id} className="relative scroll-mt-[calc(var(--design-sticky)+8px)] grid gap-6 border-b px-5 py-8 md:px-8 lg:grid-cols-[200px_1fr]">
      {/* 목차로 이동해 온 블록을 잠깐 알리는 테두리. 켜질 때는 즉시, 꺼질 때는 천천히 사라진다(모션 줄이기면 즉시) */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-[8px] rounded-md border border-transparent transition-colors duration-[1200ms] motion-reduce:transition-none',
          flash && 'border-ink/30 !duration-0',
        )}
      />
      <div>
        <Eyebrow>{title}</Eyebrow>
        {note && <p className="mt-2 text-xs text-ink-mute">{note}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** 변형 하나에 붙는 작은 이름표 */
function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Mono className="block text-xs text-ink-mute">{label}</Mono>
      {children}
    </div>
  )
}

type LayerKey = 'tokens' | 'components' | 'patterns'
type BlockDef = { title: string; note?: string; body: ReactNode }
type Layer = { key: LayerKey; title: string; note: string; blocks: BlockDef[] }

export default function DesignSystem() {
  const [tab, setTab] = useState('all')
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [range, setRange] = useState('24h')
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()
  const navigate = useNavigate()

  // 층 → 블록 목록. 탭 개수, 목차, 렌더링이 모두 이 한 곳을 쓴다
  const layers: Layer[] = [
  {
    key: 'tokens',
    title: 'Tokens',
    note: '색, 표면, 상태색, 글자. 컴포넌트는 hex를 쓰지 않고 이 값만 참조합니다.',
    blocks: [
      {
        title: 'Color & surface',
        note: '기본색은 초록이 아니라 먹색(ink)입니다. 초록은 로고(brand)와 Running 상태에만 나오고, Available은 파랑입니다. bg → surface → raised 순으로 한 단계씩 올라오며, 구분은 그림자가 아니라 1px 선이 합니다. 그림자는 떠 있는 레이어(툴팁·팝오버·메뉴)에만 예외로 씁니다.',
        body: (
          <>
            <div className="flex flex-wrap gap-3">
              {surfaces.map(([name, cls]) => (
                <div key={name} className="w-28">
                  <div className={`${cls} h-14 rounded-md border`} />
                  <Mono className="mt-1.5 block text-xs text-ink-soft">{name}</Mono>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        title: 'Status',
        note: '브랜드 그린과 겹치지 않도록 Running은 더 밝은 그린을 씁니다. 상태색은 점, 배지, 벽돌, 구성비 막대, 칩 스와치, 타임라인 아이콘과 상태 라벨에만 씁니다.',
        body: (
          <>
            <div className="flex flex-wrap gap-3">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="w-28">
                  <div className={`${STATUS_BG[s]} h-14 rounded-md`} />
                  <Mono className="mt-1.5 block text-xs text-ink-soft">st-{s}</Mono>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        title: 'Typography',
        note: '글꼴은 Pretendard 하나입니다. 호스트명, IP, 수치 같은 서버가 말하는 값은 같은 글꼴에 tabular-nums(자릿수 폭 고정)를 켜서 표에서 세로로 맞습니다. 스케일은 12 / 13 / 14 / 16 / 20 / 24 / 32. 예외로 11px는 상태 라벨과 2단 셀의 보조줄(리전 id, CPU 모델), 단축키 표시에만 씁니다.',
        body: (
          <>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-3xl font-semibold tracking-tight">서버 48대</p>
                <p className="text-xl font-semibold">리소스 사용률</p>
                <p className="text-base">베어메탈 서버를 몇 분 만에 배포하고, 한곳에서 관리하세요.</p>
                <p className="text-sm text-ink-soft">NVIDIA·AMD부터 국산 NPU까지, 이기종 가속기를 하나의 플랫폼으로.</p>
                <p className="text-xs text-ink-mute">마지막 업데이트 2분 전</p>
              </div>
              <div className="space-y-3">
                <Mono className="block text-xl">bm-seoul-01</Mono>
                <Mono className="block text-base">AMD EPYC 9354 · 64 Core · 256 GB</Mono>
                <Mono className="block text-sm text-ink-soft">10.20.1.11 / 2× 25GbE / Ubuntu 24.04</Mono>
                <div className="flex gap-6 text-lg">
                  <Value value={1024} unit="GB" />
                  <Value value={64} unit="Core" />
                  <Value value={72.4} unit="%" />
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  {
    key: 'components',
    title: 'Components',
    note: '단독으로 쓰이는 조각. 변형과 상태를 나란히 보여줍니다.',
    blocks: [
      {
        title: 'Buttons',
        note: 'Primary는 화면당 하나. 위험한 동작만 danger를 씁니다.',
        body: (
          <>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">
                  <Plus /> Create server
                </Button>
                <Button>Console</Button>
                <Button variant="ghost">
                  <RotateCw /> Reboot
                </Button>
                <Button variant="danger">
                  <Trash2 /> Delete
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Tooltip content="새로고침">
                  <Button size="icon" variant="ghost" aria-label="새로고침">
                    <RotateCw />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </>
        ),
      },
      {
        title: 'Inputs & controls',
        body: (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <Input icon={<Search />} placeholder="hostname, IP 검색" trailing={<Kbd>/</Kbd>} wrapperClassName="w-72" />
              <SegmentedControl
                value={range}
                onValueChange={setRange}
                options={[
                  { value: '1h', label: '1h' },
                  { value: '24h', label: '24h' },
                  { value: '7d', label: '7d' },
                ]}
              />
              <SegmentedControl
                value={view}
                onValueChange={setView}
                options={[
                  { value: 'table', icon: <List />, ariaLabel: '테이블 보기' },
                  { value: 'grid', icon: <LayoutGrid />, ariaLabel: '그리드 보기' },
                ]}
              />
            </div>
            {/* 좁은 화면에서는 탭 줄이 이 안에서 가로로 스크롤된다. 목록은 탭 전체 폭만큼 늘려 밑줄이 끝까지 이어지게 한다 */}
            <Tabs value={tab} onValueChange={setTab} className="mt-6 overflow-x-auto">
              <TabsList className="w-max min-w-full">
                <TabsTrigger value="all" count={48}>
                  All
                </TabsTrigger>
                <TabsTrigger value="running" count={36}>
                  Running
                </TabsTrigger>
                <TabsTrigger value="available" count={7}>
                  Available
                </TabsTrigger>
                <TabsTrigger value="maintenance" count={2}>
                  Maintenance
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        ),
      },
      {
        title: 'StatusBadge',
        note: '상태는 점(StatusDot)과 배지(StatusBadge) 두 가지로 씁니다. 배지는 24px, 상태색 12% 틴트에 테두리가 없습니다. Running 점은 천천히 숨쉽니다.',
        body: (
          <>
            <div className="space-y-5">
              <Variant label="StatusDot">
                <ul className="flex flex-wrap gap-x-8 gap-y-3">
                  {STATUS_ORDER.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm">
                      <StatusDot status={s} />
                      {STATUS_LABEL[s]}
                    </li>
                  ))}
                </ul>
              </Variant>
              <Variant label="StatusBadge">
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <StatusBadge key={s} status={s} />
                  ))}
                </div>
              </Variant>
            </div>
          </>
        ),
      },
      {
        title: 'StackBar',
        note: '전체 대비 구성비. 라운드는 바깥에만 두고 구간 사이 틈으로 나눕니다. 숫자를 넣으면 잘리지 않도록 구간 최소 폭이 6px에서 24px로 커집니다.',
        body: (
          <>
            <div className="space-y-6">
              <Variant label="기본 · 8px">
                <StackBar segments={stackSegments} />
              </Variant>
              <Variant label="showValues · 32px">
                <StackBar showValues className="h-[32px] gap-[3px]" segments={stackSegments} />
              </Variant>
            </div>
          </>
        ),
      },
      {
        title: 'BrickGrid',
        note: '서버 한 대 = 16px 벽돌 한 장. 랙 8대 단위로 묶습니다. 벽돌에 올리면 1.5px outline 링과 함께 호스트명, 상태, 랙 위치, CPU를 툴팁으로 보여주고, 누르면 상세로 갑니다.',
        body: (
          <>
            <div className="space-y-6">
              <Variant label="상태별 벽돌">
                <BrickGrid bricks={legendBricks} />
              </Variant>
              <Variant label={`랙 묶음 · ${firstRegion.region.id}`}>
                <BrickGrid bricks={bricks} />
              </Variant>
            </div>
          </>
        ),
      },
      {
        title: 'Meter',
        note: '사용률 막대. 평소 먹색(accent)이고 75%를 넘으면 warning, 90%를 넘으면 error 색으로 바뀝니다. alert를 끄면 값과 상관없이 먹색입니다.',
        body: (
          <>
            <div className="max-w-md space-y-3">
              {(
                [
                  ['42%', 42, true],
                  ['81%', 81, true],
                  ['94%', 94, true],
                  ['94% · alert off', 94, false],
                ] as const
              ).map(([k, v, alert]) => (
                <div key={k} className="grid grid-cols-[112px_1fr_44px] items-center gap-3 text-xs">
                  <Mono className="text-ink-mute">{k}</Mono>
                  <Meter value={v} alert={alert} />
                  <Value value={v} unit="%" className="text-right" />
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        title: 'Value & Sparkline',
        note: '수치는 항상 Value(tabular-nums)이고 단위는 한 단계 흐립니다. Sparkline은 축 없이 추세만 보여줍니다.',
        body: (
          <>
            <div className="flex flex-wrap items-end gap-10">
              <Value value="72.4" unit="%" className="text-3xl font-semibold tracking-tight" />
              <Sparkline data={trend} width={140} height={40} />
            </div>
          </>
        ),
      },
      {
        title: 'KeyValueList',
        note: '상세 화면의 사양 목록. 라벨은 흐리게, 값은 tabular-nums로.',
        body: (
          <>
            <div className="max-w-md">
              <KeyValueList
                items={[
                  { label: 'Hostname', value: <Mono>bm-seoul-01</Mono> },
                  { label: 'CPU', value: <Mono>AMD EPYC 9354 · 64 Core</Mono> },
                  { label: 'Memory', value: <Value value={256} unit="GB" /> },
                  { label: 'IP address', value: <Mono>10.20.1.11</Mono> },
                ]}
              />
            </div>
          </>
        ),
      },
      {
        title: 'Navigation & empty',
        note: '상세 페이지는 Breadcrumb으로 위치를 알려주고, 비어 있는 화면은 무엇이 들어올지 설명합니다.',
        body: (
          <>
            <div className="space-y-6">
              <Breadcrumb items={[{ label: 'Servers', to: '/servers' }, { label: 'bm-seoul-01' }]} />
              <EmptyState
                icon={Inbox}
                title="조건에 맞는 서버가 없습니다"
                description="검색어나 필터를 바꿔 보세요."
                action={<Button>필터 초기화</Button>}
              />
            </div>
          </>
        ),
      },
      {
        title: 'Loading',
        note: '데이터가 오기 전에는 실제 레이아웃과 같은 모양의 스켈레톤을 보여줍니다.',
        body: (
          <>
            <div className="flex items-center gap-4">
              <Skeleton className="size-8" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </>
        ),
      },
      {
        title: 'DataGrid',
        note: '열 정의 하나로 그리는 표. 정렬, 행 선택과 일괄 작업 바, 열 표시, 페이지 자르기는 TanStack Table(headless)이 상태로 다루고 모양은 토큰으로 그립니다. 행 모양은 cards(행마다 선 박스)와 ruled(구분선 한 장) 두 가지. 헤더를 누르면 기본 → 오름 → 내림 → 기본 순서로 바뀝니다. Shift를 누른 채 체크하면 범위로 선택됩니다.',
        body: (
          <>
            <DataGridVariants />
          </>
        ),
      },
      {
        title: 'Server card',
        note: 'Grid 보기의 서버 한 대. 상태 밴드(상태색 7%) → 이름과 ⋯ 메뉴 → 모델 → 스펙 3칸 → 사용률 → IP와 월 비용. GPU 서버는 모델 줄과 스펙(GPUs · VRAM · Memory)이 바뀌고, 켜져 있지 않은 서버는 사용률 대신 사유를 적습니다. 그림자 없이 선으로만 구분하고, Error 카드는 테두리에 상태색을 섞습니다. 그리드 영역이 480px보다 좁으면 같은 컴포넌트가 축약형(이름 · 모델 · CPU % 한 줄 · IP와 월 비용)으로 바뀝니다.',
        body: (
          <>
            <ServerCardVariants />
          </>
        ),
      },
      {
        title: 'Row menu & cells',
        note: '⋯ 메뉴는 표의 마지막 열과 카드에 같은 컴포넌트를 씁니다. 동작은 mock이라 요청 알림(토스트)만 띄우고, 메뉴 클릭은 행·카드의 상세 이동으로 번지지 않습니다. Compute는 GPU 구성을 먼저, Utilization은 CPU %와 56px 막대(75%/90%에서 색이 바뀜)입니다.',
        body: (
          <>
            <ServerCellSamples />
          </>
        ),
      },
      {
        title: 'Status icon & type tag',
        note: '상태 다섯 가지를 글리프(체크 · ! · X · 속 빈 원 · 렌치)로 말하는 20px 틴트 링 아이콘. 타임라인 항목과 알림 줄이 같은 컴포넌트를 씁니다. 유형 태그는 CPU / GPU를 윤곽선 3px 라운드의 11px tabular-nums로 적고, 서버 카드와 상세 헤더에 같이 쓰입니다.',
        body: (
          <>
            <div className="space-y-5">
              <Variant label="StatusIcon">
                <StatusIconRow />
              </Variant>
              <Variant label="TypeTag">
                <TypeTagSamples />
              </Variant>
            </div>
          </>
        ),
      },
      {
        title: 'Notice line',
        note: 'Warning · Error · Maintenance 서버의 헤더 아래에만 나타나는 한 줄 알림. 상태색 30% 테두리 + 7% 바탕, 틴트 링 아이콘 + 상태명 + 사유 + 시간. 사유와 시간은 그 서버의 가장 최근 같은 심각도 이벤트에서 가져옵니다.',
        body: (
          <>
            <NoticeLineSamples />
          </>
        ),
      },
      {
        title: 'Spec strip',
        note: '박스 없이 가는 선 아래에 숫자만 크게 나열합니다(Fleet status와 같은 방식). GPU 서버는 GPUs · VRAM · CPU · Memory, CPU 서버는 CPU · Memory · Storage · Network. 좁아서 줄이 바뀌면 줄 첫머리의 세로선은 사라집니다.',
        body: (
          <>
            <SpecStripSamples />
          </>
        ),
      },
    ],
  },
  {
    key: 'patterns',
    title: 'Patterns',
    note: '컴포넌트를 조합한 사용 예. Overview에 실제로 쓰이는 컴포넌트를 같은 데이터로 그립니다.',
    blocks: [
      {
        title: 'Panel vs Section',
        note: 'Panel + PanelHeader / Section + SectionHeader. Panel은 제목줄이 있는 선 박스로, 표와 차트처럼 구조가 있는 데이터를 담습니다. Section은 박스 없이 페이지 위에 바로 놓이는 요약이나 목록입니다. 모든 영역이 같은 박스로 보이지 않게 해서 중요도를 나눕니다.',
        body: (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel>
                <PanelHeader title="Panel" description="표, 차트" />
                <PanelBody className="text-sm text-ink-soft">Recent servers, Utilization, Locations</PanelBody>
              </Panel>
              <Section className="border-t pt-4">
                <SectionHeader title="Section" />
                <p className="mt-4 text-sm text-ink-soft">Fleet status, Recent activity</p>
              </Section>
            </div>
          </>
        ),
      },
      {
        title: 'Fleet status',
        note: 'Section + 큰 숫자(Value) + StackBar(showValues) + 칩 범례. 칩은 상태별 서버 목록 필터로 갑니다.',
        body: (
          <>
            <FleetStatus counts={counts} regionCount={regions.length} />
          </>
        ),
      },
      {
        title: 'Locations',
        note: 'Panel + 리전 헤더 + BrickGrid + Meter. 리전마다 벽돌로 서버 배치를, Meter로 CPU 평균을 보여줍니다.',
        body: (
          <>
            <div className="xl:max-w-[360px]">
              <LocationsPanel groups={groups} />
            </div>
          </>
        ),
      },
      {
        title: 'Recent servers',
        note: 'Panel + DataGrid(cards). 정렬과 선택 없이 열만 고른 표. 행에 올리면 화살표가 움직이고 누르면 상세로 갑니다.',
        body: (
          <>
            <RecentServers servers={recent} />
          </>
        ),
      },
      {
        title: 'Servers list',
        note: '2행 툴바(1행: 검색 + Columns · 리전 · 보기 묶음 / 2행: 상태 칩 + GPU 칩) + DataGrid(cards, 셀 여백 12px, ⋯ 메뉴). IP는 호스트명 아래에 둡니다. 표가 놓인 영역이 좁아지면 Memory(1010px 미만), Location(910px 미만) 순으로 열이 자동으로 숨고(Columns 메뉴 상태와 별개), 830px 미만에서는 카드로 시작합니다. Servers 화면에서는 이 상태를 URL에 둡니다(?status, ?gpu, ?sort, ?view, ?page).',
        body: (
          <>
            <ServersListPattern />
          </>
        ),
      },
      {
        title: 'Servers grid',
        note: 'Server card를 영역 폭에 따라 3열(960px 이상) / 2열(640px 이상) / 1열로 놓습니다. 간격 16px, 페이지당 12장(여기서는 6장).',
        body: (
          <>
            <ServersGridPattern />
          </>
        ),
      },
      {
        title: 'Timeline',
        note: 'Section + 틴트 링 상태 아이콘 + 레일. 호스트명 / 설명 / 상태 · 리전 · 시간의 3줄.',
        body: (
          <>
            <div className="max-w-[360px]">
              <ActivityFeed events={events} />
            </div>
          </>
        ),
      },
      {
        title: 'Activity list',
        note: 'DataGrid(ruled) + Event 열의 상태 아이콘(Recent activity와 같은 StatusIcon). 열 순서는 Event → Server → Time → Actor(읽는 순서). 시간순 정렬일 때는 날짜별 그룹 머리글(오늘 / 어제 / 10월 6일 (월) + 그날 건수)이 끼고 Time은 시각만 씁니다. Server로 정렬하면 그룹 없이 평평한 표가 되고 Time에 날짜가 붙습니다. Time은 시각과 상대 시간 2단, Server는 호스트명과 도시 2단, Actor는 사용자만 진하게 쓰고 시스템과 브릭섬 운영팀은 흐리게 씁니다(좁은 폭에서 가장 먼저 숨음). 실제 Activity 화면은 이 표 위에 2행 툴바(검색 · 서버 선택 · 기간 / 심각도 칩)를 얹고 상태를 URL에 둡니다(?server, ?severity, ?range, ?sort, ?page). 여기서는 URL 없이 DataGrid가 정렬과 페이지를 스스로 관리하는 비제어 모드입니다.',
        body: (
          <>
            <ActivityListPattern />
          </>
        ),
      },
      {
        title: 'Activity issues banner',
        note: 'Activity 표 위의 미해소 이슈 띠. 해소되지 않은 Warning·Error만 센다(mock의 resolvedAt이 없는 것, 기간 필터와 무관). Error가 있으면 머리 줄을 빨강으로 채우고(라이트는 흰 글자, 다크는 어두운 글자) Warning만 있으면 노랑 틴트로 한 단계 낮춰 색의 세기가 심각도를 같이 말합니다. 3건 이하는 목록까지 펼치고, 더 많으면 머리 한 줄로 접습니다. 머리의 Error·Warning 개수는 심각도 필터를 켜는 버튼이고, 목록의 행은 상세 드로어를 엽니다. 이슈가 없으면 띠 자체가 사라집니다.',
        body: (
          <>
            <OpenIssuesPattern />
          </>
        ),
      },
      {
        title: 'Activity detail drawer',
        note: '행을 누르면 오른쪽에서 420px 드로어가 겹칩니다. 목록의 필터와 스크롤은 그대로입니다. 위에서부터 상태 · 시간 · 닫기 → 제목 + 진행 여부(진행 중 / 해소됨 · 지속 시간) → 서버 · 위치 · 발생 · 해소 · 주체 · ID → 안내(Warning · Error · Maintenance만, Available · Running은 없음) → 서버 보기 · 링크 복사. 열린 이벤트는 ?event=ID로 URL에 있어 링크를 공유하면 드로어가 열린 채 열립니다. 아래 버튼으로 심각도별 모양을 열어 보세요.',
        body: (
          <>
            <ActivityDrawerPattern />
          </>
        ),
      },
      {
        title: 'Server detail',
        note: '헤더(Breadcrumb · 이름 · 상태 · 유형 · 조작) → 스펙 띠 → 탭 → Overview 2열(왼쪽 사용률 + GPU, 오른쪽 340px 레일에 Details + Recent activity). 알림 줄은 Warning · Error · Maintenance일 때 헤더와 스펙 띠 사이에 끼어듭니다. 실제 화면의 컴포넌트를 1180px 폭으로 그려 78%로 줄였습니다.',
        body: (
          <>
            <ServerDetailPattern />
          </>
        ),
      },
    ],
  },
  ]

  const requested = params.get('layer')
  const hashId = decodeURIComponent(hash.slice(1))
  // 해시로 직접 들어오면 그 블록이 있는 층을 연다
  const byHash = layers.find((l) => l.blocks.some((b) => slugify(b.title) === hashId))
  const layer = layers.find((l) => l.key === requested) ?? byHash ?? layers[0]

  // layers는 렌더마다 새로 만들어지므로 층 키로만 다시 계산한다
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => layer.blocks.map((b) => ({ id: slugify(b.title), title: b.title })), [layer.key])
  // xl 이상은 탭만, 미만은 탭 + 선택 메뉴가 sticky로 붙는다
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1280px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const stickyH = wide ? TABS_H : TABS_H + MENU_H
  const [active, select] = useActiveBlock(items.map((i) => i.id), stickyH)

  // 이동한 블록의 테두리를 1.2초 동안 강조한다. 이미 화면 안이라 스크롤이 없어도 '여기다'가 보이도록
  const [flash, setFlash] = useState<string | null>(null)
  const flashTimer = useRef(0)
  const flashBlock = useCallback((id: string) => {
    window.clearTimeout(flashTimer.current)
    setFlash(id)
    flashTimer.current = window.setTimeout(() => setFlash(null), 1200)
  }, [])
  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  // 층을 열거나 해시가 바뀌면 그 블록으로(없으면 맨 위로) 간다
  useEffect(() => {
    // 렌더마다 다시 도는 effect가 아니다: 층이나 해시가 바뀔 때만 위치를 옮긴다
    if (hashId && items.some((i) => i.id === hashId)) {
      document.getElementById(hashId)?.scrollIntoView({ block: 'start' })
      // 이동 뒤 상태 갱신은 effect 밖에서(타이머로) 한다
      const t = window.setTimeout(() => {
        select(hashId)
        flashBlock(hashId)
      })
      return () => window.clearTimeout(t)
    }
    document.querySelector('main')?.scrollTo({ top: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.key, hashId, select, flashBlock])

  const go = useCallback(
    (id: string) => {
      select(id)
      flashBlock(id)
      if (hashId === id) scrollToBlock(id)
      else navigate({ search: layer.key === 'tokens' ? '' : `?layer=${layer.key}`, hash: `#${id}` })
    },
    [hashId, layer.key, navigate, select, flashBlock],
  )

  return (
    <div style={{ '--design-sticky': `${stickyH}px` } as React.CSSProperties}>
      <PageHeader
        title="디자인 시스템"
        description="브릭섬 브랜드에서 가져온 토큰과, 모든 화면이 조립되는 컴포넌트입니다."
      />

      {/* 층 탭은 main 스크롤 안에서 위에 붙는다. 좁은 폭에서는 블록 선택 메뉴가 같이 붙는다 */}
      <div className="sticky top-0 z-20 bg-bg">
        <Tabs
          value={layer.key}
          onValueChange={(k) => setParams(k === 'tokens' ? {} : { layer: k })}
          className="overflow-x-auto px-5 md:px-8"
        >
          <TabsList className="w-max min-w-full">
            {layers.map((l) => (
              <TabsTrigger key={l.key} value={l.key} count={l.blocks.length}>
                {l.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <DesignBlockMenu items={items} active={active} onSelect={go} />
      </div>

      <div className="xl:grid xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <DesignToc items={items} active={active} onSelect={go} />
        </aside>
        <div className="min-w-0">
          <LayerHeader title={layer.title} note={layer.note} />
          {layer.blocks.map((b) => (
            <Block key={b.title} id={slugify(b.title)} title={b.title} note={b.note} flash={flash === slugify(b.title)}>
              {b.body}
            </Block>
          ))}
        </div>
      </div>
    </div>
  )
}
