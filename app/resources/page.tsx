import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentHub from '@/components/DocumentHub'
import PageHero from '@/components/PageHero'
import { documents, syllabusMatrix, syllabusStats, SEM_ORDER } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Academic resources',
  description:
    'Every timetable, syllabus, roll list, project format and statutory disclosure published by IET DAVV, in one searchable index.',
}

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Academic resources"
        title="Every document, in one place"
        standfirst={`All ${documents.length} documents the institute publishes — class and examination timetables, schemes and syllabi, roll lists, project formats, feedback reports and statutory disclosures. Search by anything, or narrow by programme, branch, year and section.`}
        crumb="Resources"
      />

      <div className="shell py-14">
        <Suspense fallback={<p className="text-ink-3">Loading documents…</p>}>
          <DocumentHub />
        </Suspense>
      </div>

      {/* ------------------------------------------- syllabus availability */}
      <section className="border-t border-line bg-paper-2">
        <div className="shell py-16 md:py-20">
          <p className="eyebrow">Scheme &amp; syllabus</p>
          <div className="rule-gold mt-3.5" />
          <h2 className="mt-5 text-[1.9rem] md:text-[2.3rem]">Semester-wise syllabus availability</h2>
          <p className="mt-4 max-w-3xl text-[0.98rem] leading-relaxed text-ink-2">
            The syllabus matrix below mirrors the structure published on the current site. It is shown here with
            its real status: of the {syllabusStats.total} semester entries listed,{' '}
            <strong className="text-ink">{syllabusStats.published} link to a document</strong> and{' '}
            <strong className="text-ink">{syllabusStats.pending} are not yet published</strong>. On the
            existing site these all render as ordinary links, so a student clicking one reaches a dead end. Marking
            them honestly costs nothing and doubles as a worklist for the departments.
          </p>

          <div className="scroll-x mt-10 rounded-[var(--radius)] border border-line bg-card">
            <table className="w-full min-w-[760px] border-collapse text-left text-[0.86rem]">
              <caption className="sr-only">
                Scheme and syllabus availability by programme, branch and semester
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Programme &amp; branch
                  </th>
                  {SEM_ORDER.map((s) => (
                    <th key={s} scope="col" className="px-3 py-3.5 text-center font-semibold">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {syllabusMatrix.map((row, i) => (
                  <tr key={`${row.programme}-${row.branch}-${row.mode ?? ''}-${i}`} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-3 font-normal">
                      <span className="block font-medium text-ink">{row.branchName}</span>
                      <span className="text-[0.76rem] text-ink-3">
                        {row.programme}
                        {row.mode ? ` · ${row.mode}` : ''}
                        {row.specialisation ? ` · ${row.specialisation}` : ''}
                      </span>
                    </th>
                    {SEM_ORDER.map((s) => {
                      const cell = row.semesterList.find((c) => c.semester === s)
                      if (!cell)
                        return (
                          <td key={s} className="px-3 py-3 text-center text-ink-3">
                            <span className="sr-only">Not applicable</span>
                            <span aria-hidden="true">·</span>
                          </td>
                        )
                      if (cell.status === 'published' && cell.url)
                        return (
                          <td key={s} className="px-3 py-3 text-center">
                            <a
                              href={cell.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded bg-green-tint px-2 py-1 text-[0.72rem] font-medium text-green-700 hover:underline"
                            >
                              PDF
                            </a>
                          </td>
                        )
                      return (
                        <td key={s} className="px-3 py-3 text-center">
                          <span className="inline-block rounded border border-dashed border-line-2 px-2 py-1 text-[0.68rem] text-ink-3">
                            Awaited
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[0.82rem] text-ink-3">
            Published syllabus documents that do exist are indexed in the search above —{' '}
            <Link href="/resources?kind=syllabus" className="text-saffron-600 hover:underline">
              view them
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
