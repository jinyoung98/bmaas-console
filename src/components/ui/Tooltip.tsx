import { Tooltip as T } from 'radix-ui'
import type { ReactNode } from 'react'

export const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <T.Provider delayDuration={250} skipDelayDuration={100}>
    {children}
  </T.Provider>
)

type Props = { content: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }

export function Tooltip({ content, children, side = 'top' }: Props) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md border bg-ink px-2 py-1 text-xs text-bg shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}
