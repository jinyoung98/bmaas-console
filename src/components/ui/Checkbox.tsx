import { Check, Minus } from 'lucide-react'
import { useEffect, useRef, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<ComponentProps<'input'>, 'type'> & { indeterminate?: boolean }

/**
 * 14px 체크박스. 표의 행 선택 핸들러가 event.target.checked와 Shift 키를 읽으므로 native input을 그대로 쓰고 모양만 덮는다.
 * 일부만 선택된 상태(indeterminate)는 속성이 없어서 ref로 넣는다.
 */
export function Checkbox({ indeterminate = false, checked, className, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  const on = Boolean(checked) || indeterminate
  return (
    <span className={cn('relative inline-grid size-[14px] shrink-0 place-items-center align-middle', className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className={cn(
          'size-[14px] cursor-pointer appearance-none rounded-[3px] border transition-colors',
          on ? 'border-ink bg-ink' : 'border-line-strong bg-raised hover:border-ink-mute',
        )}
        {...props}
      />
      {on && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-bg">
          {indeterminate ? <Minus className="size-[10px]" strokeWidth={3} /> : <Check className="size-[10px]" strokeWidth={3} />}
        </span>
      )}
    </span>
  )
}
