import { useCallback, useState } from 'react'

/**
 * 제어형/비제어형을 한 번에 다룬다. value를 넘기면(undefined가 아니면) 그 값을 쓰고 바꿀 때 onChange만 부른다(제어형).
 * 넘기지 않으면 defaultValue로 시작하는 내부 상태를 쓰고, 바꿀 때 내부 상태를 갱신한 뒤 onChange도 부른다(비제어형).
 */
export function useControllableState<V>(value: V | undefined, defaultValue: V, onChange?: (next: V) => void) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner

  const set = useCallback(
    (next: V) => {
      if (!controlled) setInner(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )

  return [current, set] as const
}
