import { Inbox, LayoutGrid, List, Plus, RotateCw, Search, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
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
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Kbd } from '@/components/ui/Kbd'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { STATUS_BG, STATUS_LABEL, STATUS_ORDER, type ServerStatus } from '@/lib/status'

const surfaces = [
  ['bg', 'bg-bg'],
  ['surface', 'bg-surface'],
  ['raised', 'bg-raised'],
  ['sunken', 'bg-sunken'],
  ['accent', 'bg-accent'],
  ['accent-subtle', 'bg-accent-subtle'],
]

// Overview의 벽돌 그리드에서 쓸 모양을 미리 보여주는 샘플
const brickSample: ServerStatus[] = Array.from({ length: 36 }, (_, i) =>
  i === 30 ? 'error' : i === 27 ? 'warning' : i === 13 || i === 14 ? 'maintenance' : i % 9 === 4 ? 'available' : 'running',
)

const trend = [32, 36, 34, 41, 39, 47, 52, 49, 58, 55, 63, 61, 68, 64, 72]

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

export default function DesignSystem() {
  const [tab, setTab] = useState('all')
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [range, setRange] = useState('24h')

  return (
    <>
      <PageHeader
        eyebrow="Design system"
        title="디자인 시스템"
        description="브릭섬 브랜드에서 가져온 토큰과, 모든 화면이 조립되는 컴포넌트입니다."
      />

      <Block title="Surface" note="bg → surface → raised 순으로 한 단계씩 올라옵니다. 구분은 그림자가 아니라 1px 선이 합니다.">
        <div className="flex flex-wrap gap-3">
          {surfaces.map(([name, cls]) => (
            <div key={name} className="w-28">
              <div className={`${cls} h-14 rounded-md border`} />
              <Mono className="mt-1.5 block text-xs text-ink-soft">{name}</Mono>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Status" note="브랜드 그린과 겹치지 않도록 Running은 더 밝은 그린을 씁니다. 점, 배지, 벽돌에서만 사용합니다.">
        <div className="space-y-5">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <StatusDot status={s} />
                {STATUS_LABEL[s]}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {brickSample.map((s, i) => (
              <span key={i} className={`size-5 rounded-[3px] ${STATUS_BG[s]}`} />
            ))}
          </div>
        </div>
      </Block>

      <Block title="Typography" note="본문은 Pretendard, 서버가 말하는 값은 JetBrains Mono. 스케일은 12 / 13 / 14 / 16 / 20 / 24 / 32.">
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
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
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

      <Block title="Data display" note="수치는 항상 Mono. 막대는 평소 브랜드 그린이고 임계값을 넘으면 상태 색으로 바뀝니다.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="CPU utilization" description="최근 24시간" actions={<StatusBadge status="running" />} />
            <PanelBody className="space-y-5">
              <div className="flex items-end justify-between">
                <Value value="72.4" unit="%" className="text-3xl font-semibold tracking-tight" />
                <Sparkline data={trend} width={140} height={40} />
              </div>
              <div className="space-y-3">
                {[
                  ['normal', 42],
                  ['warning', 81],
                  ['critical', 94],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[72px_1fr_44px] items-center gap-3 text-xs">
                    <span className="text-ink-mute">{k}</span>
                    <Meter value={v as number} />
                    <Value value={v as number} unit="%" className="text-right" />
                  </div>
                ))}
              </div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Fleet" description="상태별 서버 수" />
            <PanelBody className="space-y-5">
              <StackBar
                segments={STATUS_ORDER.map((s, i) => ({
                  key: s,
                  label: STATUS_LABEL[s],
                  value: [36, 7, 2, 2, 1][i],
                  className: STATUS_BG[s],
                }))}
              />
              <KeyValueList
                items={[
                  { label: 'Hostname', value: <Mono>bm-seoul-01</Mono> },
                  { label: 'CPU', value: <Mono>AMD EPYC 9354 · 64 Core</Mono> },
                  { label: 'Memory', value: <Value value={256} unit="GB" /> },
                  { label: 'IP address', value: <Mono>10.20.1.11</Mono> },
                ]}
              />
            </PanelBody>
          </Panel>
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
    </>
  )
}
