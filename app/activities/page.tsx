import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/PageHero'
import { campus } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Activities',
  description:
    'Student chapters, societies and campus activity at IET DAVV — GDSC, the IET Newsletter, Live@IET and NSS.',
}

const SECTIONS = [
  {
    id: 'gdsc',
    title: 'GDSC',
    subtitle: 'Google Developer Student Club',
    body: [
      'The student-run developer community on campus, running workshops, study jams and build sessions across web, cloud, mobile and machine learning.',
      'Open to students of every branch and year; sessions are announced through the notice board and the club’s own channels.',
    ],
    image: '/media/events/campus-life-01.jpg',
  },
  {
    id: 'newsletter',
    title: 'IET-Newsletter',
    subtitle: 'The institute newsletter',
    body: [
      'The institute’s periodic newsletter, carrying departmental news, research highlights, placement results, student achievement and event coverage.',
      'Back issues are published here as they are digitised.',
    ],
    image: '/media/events/ishrae-02.jpg',
  },
  {
    id: 'live',
    title: 'Live@IET',
    subtitle: 'Events, fests and campus happenings',
    body: [
      'Coverage of what is actually happening on campus — technical fests, cultural evenings, inter-department tournaments, guest lectures and industry visits.',
      'Shakshank, Central India’s largest cultural fest, is hosted on this campus.',
    ],
    image: '/media/events/chess-tournament.jpg',
  },
  {
    id: 'nss',
    title: 'NSS',
    subtitle: 'National Service Scheme',
    body: [
      'The institute’s NSS unit runs community outreach, blood donation drives, cleanliness and awareness campaigns, and village adoption work around Indore.',
      'Participation counts towards the co-curricular record and is open to all enrolled students.',
    ],
    image: '/media/campus/campus-06.jpg',
  },
]

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Student life"
        title="Activities"
        standfirst="Clubs, chapters and the year-round activity that happens alongside the timetable — developer communities, the institute newsletter, campus events and national service."
        crumb="Activities"
      />

      <div className="shell py-16 md:py-20">
        <div className="space-y-20">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                }`}
              >
                <div>
                  <p className="eyebrow">{s.subtitle}</p>
                  <div className="rule-gold mt-3.5" />
                  <h2 className="mt-5 text-[1.9rem] md:text-[2.2rem]">{s.title}</h2>
                  <div className="prose-block mt-5">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 30)}>{p}</p>
                    ))}
                  </div>
                </div>
                <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover"
                  />
                </figure>
              </div>
            </section>
          ))}
        </div>

        {/* ------------------------------------------------ student chapters */}
        <section className="mt-24 border-t border-line pt-14">
          <p className="eyebrow">Chapters &amp; societies</p>
          <div className="rule-gold mt-3.5" />
          <h2 className="mt-5 text-[1.9rem] md:text-[2.2rem]">Student chapters</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {campus.societies.map((s) => (
              <article key={s.name} className="rounded-lg border border-line bg-card p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[1.15rem]">{s.name}</h3>
                  {s.since !== '—' && (
                    <span className="shrink-0 rounded border border-line bg-paper-2 px-2 py-0.5 text-[0.7rem] text-ink-3">
                      since {s.since}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-2">{s.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
