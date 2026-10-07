import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

// 실제 상태는 <html class="dark">가 단일 출처다. index.html의 인라인 스크립트가 먼저 정한다.
function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

const read = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme)

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* 저장 실패는 무시. 세션 동안은 동작한다 */
    }
  }, [])

  const toggle = useCallback(() => setTheme(read() === 'dark' ? 'light' : 'dark'), [setTheme])

  return { theme, setTheme, toggle }
}
