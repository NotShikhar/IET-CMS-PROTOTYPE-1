import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { programmes } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Programmes',
  description:
    'Twenty-seven programmes across B.Tech, B.Des, M.Tech, MBA, M.Sc and Ph.D at the Institute of Engineering & Technology, DAVV Indore.',
}

export default function ProgrammesPage() {
  const total = programmes.reduce((a, g) => a + g.items.length, 0)

  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="Twenty-seven programmes"
        standfirst={`${total} programmes across six awards — nine undergraduate engineering branches, seven postgraduate specialisations, management, science and eight doctoral streams. Admission is through the University's Computer Based Common Entrance Test.`}
        crumb="Programmes"
      />

      <div className="shell py-16 md:py-20">
        <div className="space-y-16">
          {programmes.map((group) => (
            <section key={`${group.award}-${group.mode}`} aria-labelledby={`${group.award}-${group.mode}`.replace(/\W+/g, '-')}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-line pb-4">
                <h2
                  id={`${group.award}-${group.mode}`.replace(/\W+/g, '-')}
                  className="text-[1.8rem] md:text-[2.1rem]"
                >
                  {group.award}
                </h2>
                <span className="rounded border border-line-2 bg-paper-2 px-2.5 py-1 text-[0.72rem] font-medium text-ink-2">
                  {group.mode}
                </span>
                <span className="text-[0.82rem] text-ink-3">{group.duration}</span>
                <span className="ml-auto text-[0.82rem] tabular-nums text-ink-3">
                  {group.items.length} {group.items.length === 1 ? 'programme' : 'programmes'}
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-ink-2">{group.blurb}</p>

              <ol className="mt-8 grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, i) => (
                  <li
                    key={item.name + item.code}
                    className="flex items-start gap-4 rounded-[var(--radius)] border border-line bg-card p-5"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 font-[family-name:var(--font-display)] text-[0.95rem] font-semibold text-gold"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="block text-[0.95rem] font-medium leading-snug">{item.name}</span>
                      <span className="mt-1 block text-[0.78rem] text-ink-3">{item.code}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="mt-20 rounded-[var(--radius)] border border-line bg-paper-2 p-8 md:p-10">
          <h2 className="text-[1.5rem]">Looking for the syllabus?</h2>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-2">
            Scheme and syllabus documents under the CBCS structure, along with class timetables and roll lists for
            every branch and year, are indexed in the resource hub.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/resources?kind=syllabus"
              className="rounded-md bg-green-700 px-5 py-2.5 text-[0.88rem] font-medium text-on-green"
            >
              Schemes &amp; syllabi
            </Link>
            <Link
              href="/admissions"
              className="rounded-md border border-line-2 px-5 py-2.5 text-[0.88rem] font-medium transition-colors hover:border-green-600 hover:text-green-700"
            >
              Admissions 2026-27
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
