import { useLayoutEffect, useState } from 'react'

/**
 * 요소의 안쪽 폭(clientWidth)을 잰다. 뷰포트가 아니라 그 요소가 놓인 영역 기준으로 반응형을 정할 때 쓴다.
 * 첫 페인트 전에 재므로 깜빡이지 않는다. enabled가 false면 재지 않고 null을 돌려준다.
 * 사용: const [ref, width] = useElementWidth(); <div ref={ref} />
 */
export function useElementWidth<E extends HTMLElement = HTMLDivElement>(enabled = true) {
  const [el, setEl] = useState<E | null>(null)
  const [width, setWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled || !el) return
    // 관찰을 시작하면 첫 알림이 레이아웃 직후, 페인트 전에 온다. 그래서 따로 재지 않아도 첫 화면부터 폭이 맞다
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [enabled, el])

  return [setEl, enabled ? width : null] as const
}
