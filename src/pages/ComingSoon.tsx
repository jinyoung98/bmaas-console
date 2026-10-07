import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { EmptyState } from '@/components/data/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'

type Props = { eyebrow?: string; title: string; description: string; icon: LucideIcon; emptyTitle: string; emptyBody: string }

/** 아직 열리지 않은 메뉴. 정보 구조는 보여주되 빈 화면으로 두지 않는다 */
export function ComingSoon({ eyebrow, title, description, icon, emptyTitle, emptyBody }: Props) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="px-5 py-8 md:px-8">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyBody}
          action={
            <Button>
              Read the docs <ArrowUpRight />
            </Button>
          }
        />
      </div>
    </>
  )
}
