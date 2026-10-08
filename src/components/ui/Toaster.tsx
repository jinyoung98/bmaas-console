import { Toaster as Sonner } from 'sonner'

/**
 * 화면 오른쪽 아래에 뜨는 짧은 알림(sonner). 기본 스타일은 끄고 토큰으로 다시 그린다.
 * 떠 있는 레이어라 그림자를 쓰는 예외에 해당한다.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-[340px] items-center gap-[10px] rounded-lg border bg-raised px-[14px] py-[12px] text-sm text-ink shadow-[0_8px_30px_rgb(0_0_0/0.14)]',
          title: 'font-medium',
          description: 'text-xs text-ink-mute',
        },
      }}
    />
  )
}
