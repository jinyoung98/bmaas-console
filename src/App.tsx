import { KeyRound, Network } from 'lucide-react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { ComingSoon } from '@/pages/ComingSoon'
import DesignSystem from '@/pages/DesignSystem'
import Overview from '@/pages/Overview'
import { Placeholder } from '@/pages/Placeholder'

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route
              path="servers/:id"
              element={<Placeholder eyebrow="Servers" title="Server detail" description="서버 상세 화면입니다." step="6" />}
            />
            <Route
              path="servers"
              element={
                <Placeholder title="Servers" description="베어메탈 서버를 관리합니다." step="5" />
              }
            />
            <Route
              path="activity"
              element={
                <Placeholder title="Activity" description="서버에서 일어난 모든 이벤트입니다." step="7" />
              }
            />
            <Route
              path="networks"
              element={
                <ComingSoon
                  title="Networks"
                  description="VLAN과 사설망으로 서버를 연결합니다."
                  icon={Network}
                  emptyTitle="아직 만든 네트워크가 없습니다"
                  emptyBody="서버끼리 격리된 사설망으로 연결하는 기능을 준비하고 있습니다."
                />
              }
            />
            <Route
              path="ssh-keys"
              element={
                <ComingSoon
                  title="SSH keys"
                  description="서버 접속에 쓸 공개키를 등록합니다."
                  icon={KeyRound}
                  emptyTitle="등록된 SSH 키가 없습니다"
                  emptyBody="공개키를 등록하면 새 서버를 만들 때 바로 선택할 수 있습니다."
                />
              }
            />
            <Route path="design" element={<DesignSystem />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}
