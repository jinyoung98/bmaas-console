import { useCallback, useEffect, useRef, useState } from 'react'

/** 블록 title에서 앵커 id를 만든다: "Value & Sparkline" → "value-sparkline" */
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export type NavItem = { id: string; title: string }

/** sticky 층 탭의 높이. Tabs의 h-10은 rem(2.5 × 14px)이라 35px로 그려진다. 앵커 이동과 목차 sticky의 기준이 된다 */
export const TABS_H = 35
/** xl 미만에서는 탭 아래에 선택 메뉴 한 줄(40px)이 더 붙는다 */
export const MENU_H = 40

/** main이 스크롤 컨테이너다. 문서 스크롤이 아니라 이 안에서 움직인다 */
const scroller = () => document.querySelector('main')

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToBlock(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' })
}

/** 기준선은 sticky 바 아래로 이만큼 내려온 곳. 블록 제목이 이 선을 지나면 그 블록을 읽는 중으로 본다 */
const BASELINE_GAP = 16
/** 클릭 직후 스크롤 이동이 끝날 때까지 스크롤 계산이 클릭한 항목을 덮어쓰지 않도록 하는 시간 */
const LOCK_MS = 600
const LOCK_MAX_MS = 1500

/**
 * 열린 층에서 지금 읽고 있는 블록: 기준선(sticky 바 높이 + 여유)을 지난 마지막 블록.
 * main의 passive scroll 리스너 + requestAnimationFrame 쓰로틀로 계산하고, 마운트·층 전환·리사이즈에도 한 번 계산한다.
 * 맨 아래까지 내려가면(마지막 블록이 짧아 기준선에 닿지 못해도) 마지막 블록이 활성이다.
 * select(id)는 클릭용: 즉시 활성으로 만들고 이동이 끝날 때까지 스크롤 계산이 덮어쓰지 못하게 잠근다.
 * 스크롤이 일어나지 않는 층에서는 스크롤 이벤트가 없으니 클릭한 항목이 그대로 유지된다.
 */
export function useActiveBlock(ids: string[], offset: number) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join()
  const lock = useRef({ until: 0, max: 0 })

  const select = useCallback((id: string) => {
    const now = performance.now()
    lock.current = { until: now + LOCK_MS, max: now + LOCK_MAX_MS }
    setActive(id)
  }, [])

  useEffect(() => {
    const root = scroller()
    if (!root) return
    setActive(ids[0])
    let raf = 0

    const compute = () => {
      raf = 0
      const now = performance.now()
      if (now < lock.current.until) return
      const baseline = root.getBoundingClientRect().top + offset + BASELINE_GAP
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= baseline) current = id
      }
      const atBottom = root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2
      setActive(atBottom ? ids[ids.length - 1] : current)
    }
    const schedule = () => {
      // 잠겨 있는 동안 스크롤이 이어지면(부드러운 이동) 잠금을 조금씩 늘려 이동이 끝난 뒤에 계산한다
      const now = performance.now()
      if (now < lock.current.until) lock.current.until = Math.min(lock.current.max, now + 150)
      if (!raf) raf = requestAnimationFrame(compute)
    }

    root.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // 층을 막 열었을 때 한 번(첫 계산은 이어지는 해시 이동 뒤에 다시 한다)
    compute()
    return () => {
      root.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
    // ids는 key로 비교한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset])

  return [active, select] as const
}
