import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const envs = [
  { id: 'production', label: 'Production' },
  { id: 'staging', label: 'Staging' },
  { id: 'development', label: 'Development' },
]

/** Supabase 식 프로젝트 스위처. 조직과 환경을 헤더에서 바로 바꾼다 */
export function EnvSwitcher() {
  const [env, setEnv] = useState('production')
  const current = envs.find((e) => e.id === env)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors hover:bg-accent-subtle data-[state=open]:bg-accent-subtle"
        >
          <span className="grid size-5 place-items-center rounded-sm bg-accent text-[11px] font-semibold text-accent-ink">A</span>
          <span className="hidden font-medium sm:inline">Acme AI</span>
          <span className="rounded-sm border px-1.5 text-[11px] leading-[18px] text-ink-soft">{current.label}</span>
          <ChevronsUpDown className="size-3.5 text-ink-mute" strokeWidth={1.6} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Environment</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={env} onValueChange={setEnv}>
          {envs.map((e) => (
            <DropdownMenuRadioItem key={e.id} value={e.id}>
              {e.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="pb-2">
          Organization <span className="ml-1 text-ink-soft">Acme AI</span>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
