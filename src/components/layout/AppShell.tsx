import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        {/* relative: 위치 지정 조상이 없는 absolute 자손(sr-only 등)이 main 밖 body 기준으로 잡혀 문서에 두 번째 스크롤을 만드는 것을 막는다 */}
        <main className="relative min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
