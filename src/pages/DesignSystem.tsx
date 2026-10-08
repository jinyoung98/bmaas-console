import { Inbox, LayoutGrid, List, Plus, RotateCw, Search, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
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
import { DataGridVariants, ServersListPattern } from '@/features/design/DataGridDemos'
import { ServerCardVariants, ServerCellSamples, ServersGridPattern } from '@/features/design/ServerDemos'
import { FleetStatus } from '@/features/overview/FleetStatus'
import { LocationsPanel, RACK_SIZE } from '@/features/overview/LocationsPanel'
import { RecentServers } from '@/features/overview/RecentServers'
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

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-b px-5 py-8 md:px-8 lg:grid-cols-[200px_1fr]">
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

export default function DesignSystem() {
  const [tab, setTab] = useState('all')
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [range, setRange] = useState('24h')

  return (
    <>
      <PageHeader
        title="디자인 시스템"
        description="브릭섬 브랜드에서 가져온 토큰과, 모든 화면이 조립되는 컴포넌트입니다."
      />

      <LayerHeader title="Tokens" note="색, 표면, 상태색, 글자. 컴포넌트는 hex를 쓰지 않고 이 값만 참조합니다." />

      <Block
        title="Color & surface"
        note="기본색은 초록이 아니라 먹색(ink)입니다. 초록은 로고(brand)와 Running 상태에만 나오고, Available은 파랑입니다. bg → surface → raised 순으로 한 단계씩 올라오며, 구분은 그림자가 아니라 1px 선이 합니다. 그림자는 떠 있는 레이어(툴팁·팝오버·메뉴)에만 예외로 씁니다."
      >
        <div className="flex flex-wrap gap-3">
          {surfaces.map(([name, cls]) => (
            <div key={name} className="w-28">
              <div className={`${cls} h-14 rounded-md border`} />
              <Mono className="mt-1.5 block text-xs text-ink-soft">{name}</Mono>
            </div>
          ))}
        </div>
      </Block>

      <Block
        title="Status"
        note="브랜드 그린과 겹치지 않도록 Running은 더 밝은 그린을 씁니다. 상태색은 점, 배지, 벽돌, 구성비 막대, 칩 스와치, 타임라인 아이콘과 상태 라벨에만 씁니다."
      >
        <div className="flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="w-28">
              <div className={`${STATUS_BG[s]} h-14 rounded-md`} />
              <Mono className="mt-1.5 block text-xs text-ink-soft">st-{s}</Mono>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography" note="본문은 Pretendard, 서버가 말하는 값은 JetBrains Mono. 스케일은 12 / 13 / 14 / 16 / 20 / 24 / 32. 예외로 11px는 상태 라벨과 2단 셀의 보조줄(리전 id, CPU 모델), 단축키 표시에만 씁니다.">
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
      </Block>

      <LayerHeader title="Components" note="단독으로 쓰이는 조각. 변형과 상태를 나란히 보여줍니다." />

      <Block title="Buttons" note="Primary는 화면당 하나. 위험한 동작만 danger를 씁니다.">
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
      </Block>

      <Block title="Inputs & controls">
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
      </Block>

      <Block title="StatusBadge" note="상태는 점(StatusDot)과 배지(StatusBadge) 두 가지로 씁니다. 배지는 24px, 상태색 12% 틴트에 테두리가 없습니다. Running 점은 천천히 숨쉽니다.">
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
      </Block>

      <Block title="StackBar" note="전체 대비 구성비. 라운드는 바깥에만 두고 구간 사이 틈으로 나눕니다. 숫자를 넣으면 잘리지 않도록 구간 최소 폭이 6px에서 24px로 커집니다.">
        <div className="space-y-6">
          <Variant label="기본 · 8px">
            <StackBar segments={stackSegments} />
          </Variant>
          <Variant label="showValues · 32px">
            <StackBar showValues className="h-[32px] gap-[3px]" segments={stackSegments} />
          </Variant>
        </div>
      </Block>

      <Block title="BrickGrid" note="서버 한 대 = 16px 벽돌 한 장. 랙 8대 단위로 묶습니다. 벽돌에 올리면 1.5px outline 링과 함께 호스트명, 상태, 랙 위치, CPU를 툴팁으로 보여주고, 누르면 상세로 갑니다.">
        <div className="space-y-6">
          <Variant label="상태별 벽돌">
            <BrickGrid bricks={legendBricks} />
          </Variant>
          <Variant label={`랙 묶음 · ${firstRegion.region.id}`}>
            <BrickGrid bricks={bricks} />
          </Variant>
        </div>
      </Block>

      <Block title="Meter" note="사용률 막대. 평소 먹색(accent)이고 75%를 넘으면 warning, 90%를 넘으면 error 색으로 바뀝니다. alert를 끄면 값과 상관없이 먹색입니다.">
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
      </Block>

      <Block title="Value & Sparkline" note="수치는 항상 Mono(Value)이고 단위는 한 단계 흐립니다. Sparkline은 축 없이 추세만 보여줍니다.">
        <div className="flex flex-wrap items-end gap-10">
          <Value value="72.4" unit="%" className="text-3xl font-semibold tracking-tight" />
          <Sparkline data={trend} width={140} height={40} />
        </div>
      </Block>

      <Block title="KeyValueList" note="상세 화면의 사양 목록. 라벨은 흐리게, 값은 Mono로.">
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
      </Block>

      <Block title="Navigation & empty" note="상세 페이지는 Breadcrumb으로 위치를 알려주고, 비어 있는 화면은 무엇이 들어올지 설명합니다.">
        <div className="space-y-6">
          <Breadcrumb items={[{ label: 'Servers', to: '/servers' }, { label: 'bm-seoul-01' }]} />
          <EmptyState
            icon={Inbox}
            title="조건에 맞는 서버가 없습니다"
            description="검색어나 필터를 바꿔 보세요."
            action={<Button>필터 초기화</Button>}
          />
        </div>
      </Block>

      <Block title="Loading" note="데이터가 오기 전에는 실제 레이아웃과 같은 모양의 스켈레톤을 보여줍니다.">
        <div className="flex items-center gap-4">
          <Skeleton className="size-8" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </Block>

      <Block
        title="DataGrid"
        note="열 정의 하나로 그리는 표. 정렬, 행 선택과 일괄 작업 바, 열 표시, 페이지 자르기는 TanStack Table(headless)이 상태로 다루고 모양은 토큰으로 그립니다. 행 모양은 cards(행마다 선 박스)와 ruled(구분선 한 장) 두 가지. 헤더를 누르면 기본 → 오름 → 내림 → 기본 순서로 바뀝니다. Shift를 누른 채 체크하면 범위로 선택됩니다."
      >
        <DataGridVariants />
      </Block>

      <Block
        title="Server card"
        note="Grid 보기의 서버 한 대. 상태 밴드(상태색 7%) → 이름과 ⋯ 메뉴 → 모델 → 스펙 3칸 → 사용률 → IP와 월 비용. GPU 서버는 모델 줄과 스펙(GPUs · VRAM · Memory)이 바뀌고, 켜져 있지 않은 서버는 사용률 대신 사유를 적습니다. 그림자 없이 선으로만 구분하고, Error 카드는 테두리에 상태색을 섞습니다. 그리드 영역이 480px보다 좁으면 같은 컴포넌트가 축약형(이름 · 모델 · CPU % 한 줄 · IP와 월 비용)으로 바뀝니다."
      >
        <ServerCardVariants />
      </Block>

      <Block
        title="Row menu & cells"
        note="⋯ 메뉴는 표의 마지막 열과 카드에 같은 컴포넌트를 씁니다. 동작은 mock이라 요청 알림(토스트)만 띄우고, 메뉴 클릭은 행·카드의 상세 이동으로 번지지 않습니다. Compute는 GPU 구성을 먼저, Utilization은 CPU %와 56px 막대(75%/90%에서 색이 바뀜)입니다."
      >
        <ServerCellSamples />
      </Block>

      <LayerHeader title="Patterns" note="컴포넌트를 조합한 사용 예. Overview에 실제로 쓰이는 컴포넌트를 같은 데이터로 그립니다." />

      <Block
        title="Panel vs Section"
        note="Panel + PanelHeader / Section + SectionHeader. Panel은 제목줄이 있는 선 박스로, 표와 차트처럼 구조가 있는 데이터를 담습니다. Section은 박스 없이 페이지 위에 바로 놓이는 요약이나 목록입니다. 모든 영역이 같은 박스로 보이지 않게 해서 중요도를 나눕니다."
      >
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
      </Block>

      <Block title="Fleet status" note="Section + 큰 숫자(Value) + StackBar(showValues) + 칩 범례. 칩은 상태별 서버 목록 필터로 갑니다.">
        <FleetStatus counts={counts} regionCount={regions.length} />
      </Block>

      <Block title="Locations" note="Panel + 리전 헤더 + BrickGrid + Meter. 리전마다 벽돌로 서버 배치를, Meter로 CPU 평균을 보여줍니다.">
        <div className="xl:max-w-[360px]">
          <LocationsPanel groups={groups} />
        </div>
      </Block>

      <Block title="Recent servers" note="Panel + DataGrid(cards). 정렬과 선택 없이 열만 고른 표. 행에 올리면 화살표가 움직이고 누르면 상세로 갑니다.">
        <RecentServers servers={recent} />
      </Block>

      <Block
        title="Servers list"
        note="2행 툴바(1행: 검색 + Columns · 리전 · 보기 묶음 / 2행: 상태 칩 + GPU 칩) + DataGrid(cards, 셀 여백 12px, ⋯ 메뉴). IP는 호스트명 아래에 둡니다. 표가 놓인 영역이 좁아지면 Memory(1010px 미만), Location(910px 미만) 순으로 열이 자동으로 숨고(Columns 메뉴 상태와 별개), 830px 미만에서는 카드로 시작합니다. Servers 화면에서는 이 상태를 URL에 둡니다(?status, ?gpu, ?sort, ?view, ?page)."
      >
        <ServersListPattern />
      </Block>

      <Block title="Servers grid" note="Server card를 영역 폭에 따라 3열(960px 이상) / 2열(640px 이상) / 1열로 놓습니다. 간격 16px, 페이지당 12장(여기서는 6장).">
        <ServersGridPattern />
      </Block>

      <Block title="Timeline" note="Section + 틴트 링 상태 아이콘 + 레일. 호스트명 / 설명 / 상태 · 리전 · 시간의 3줄.">
        <div className="max-w-[360px]">
          <ActivityFeed events={events} />
        </div>
      </Block>
    </>
  )
}
