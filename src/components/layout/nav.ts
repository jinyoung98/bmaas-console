import { Activity, KeyRound, LayoutGrid, Network, Palette, Server, type LucideIcon } from 'lucide-react'

import { servers } from '@/mock/servers'

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean; count?: number }
export type NavGroup = { label: string; items: NavItem[] }

/** 사이드바, 모바일 시트, 아이콘 레일이 모두 이 한 곳을 읽는다 */
export const navGroups: NavGroup[] = [
  {
    label: 'Compute',
    items: [
      { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
      { to: '/servers', label: 'Servers', icon: Server, count: servers.length },
      { to: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'Network',
    items: [
      { to: '/networks', label: 'Networks', icon: Network },
      { to: '/ssh-keys', label: 'SSH keys', icon: KeyRound },
    ],
  },
  {
    label: 'Design',
    items: [{ to: '/design', label: 'Design system', icon: Palette }],
  },
]
