import { PageHeader } from '@/components/common/PageHeader'

type Props = { eyebrow: string; title: string; description: string; step: string }

export function Placeholder({ eyebrow, title, description, step }: Props) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="px-5 py-10 md:px-8">
        <p className="num text-xs text-ink-mute">{step} 단계에서 구현 예정</p>
      </div>
    </>
  )
}
