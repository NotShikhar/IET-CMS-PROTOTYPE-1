import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import NoticeBoard from '@/components/NoticeBoard'
import { notices } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Notices',
  description: 'Latest, examination and tender notices from IET DAVV Indore.',
}

export default function NoticesPage() {
  return (
    <>
      <PageHero
        eyebrow="Announcements"
        title="Notices"
        standfirst={`${notices.length} current notices. Examination notices and tenders are the same feed, filtered — so a notice published once appears everywhere it belongs.`}
        crumb="Notices"
      />

      <div className="shell py-14">
        <div className="mx-auto max-w-3xl">
          <NoticeBoard />
        </div>
      </div>
    </>
  )
}
