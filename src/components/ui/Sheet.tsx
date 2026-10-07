import { Dialog as S } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Sheet = S.Root
export const SheetTrigger = S.Trigger
export const SheetClose = S.Close

type Props = ComponentProps<typeof S.Content> & { title: string }

/** 왼쪽에서 밀려 나오는 패널. 모바일 내비게이션에 쓴다. title은 스크린리더용이다 */
export function SheetContent({ className, children, title, ...props }: Props) {
  return (
    <S.Portal>
      <S.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
      <S.Content
        aria-describedby={undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r bg-surface outline-none',
          'data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out',
          className,
        )}
        {...props}
      >
        <S.Title className="sr-only">{title}</S.Title>
        {children}
      </S.Content>
    </S.Portal>
  )
}
