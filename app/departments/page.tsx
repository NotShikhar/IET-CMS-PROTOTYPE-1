import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { departments, documents, people } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Departments',
  description:
    'Eight departments and over 71 faculty members across engineering and science at IET DAVV Indore.',
}

export default function DepartmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="The institute"
        title="Eight departments"
        standfirst="IET-DAVV has eight departments spanning engineering and science streams, with more than 71 faculty members including regular, visiting and adjunct staff."
        crumb="Departments"
      />

      <div className="shell py-16 md:py-20">
        <div className="grid gap-3 md:grid-cols-2">
          {departments.map((d) => {
            const count = documents.filter(
              (doc) => doc.branch === d.code || (doc.branches ?? []).includes(d.code as never),
            ).length
            return (
              <article
                key={d.code}
                className="flex flex-col rounded-[var(--radius)] border border-line bg-card p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[1.35rem] leading-snug">{d.name}</h2>
                  <span className="shrink-0 rounded border border-line-2 bg-paper-2 px-2 py-0.5 text-[0.7rem] font-medium text-ink-3">
                    {d.code}
                  </span>
                </div>
                <p className="mt-4 flex-1 text-[0.9rem] leading-relaxed text-ink-2">{d.blurb}</p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {d.programmes.map((p) => (
                    <li
                      key={p}
                      className="rounded border border-line bg-paper-2 px-2 py-0.5 text-[0.72rem] text-ink-3"
                    >
                      {p}
                    </li>
                  ))}
                </ul>

                {count > 0 && (
                  <Link
                    href={`/resources?branch=${encodeURIComponent(d.code)}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-saffron-600 hover:underline"
                  >
                    {count} {count === 1 ? 'document' : 'documents'}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            )
          })}
        </div>

        {/* ------------------------------------------------------ leadership */}
        <section className="mt-20">
          <p className="eyebrow">Administration</p>
          <div className="rule-gold mt-3.5" />
          <h2 className="mt-5 text-[1.9rem] md:text-[2.2rem]">Who runs the institute</h2>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            <PersonCard person={people.director} />
            <PersonCard person={people.administrativeOfficer} />
          </div>

          <p className="mt-8 max-w-2xl text-[0.88rem] leading-relaxed text-ink-3">
            Heads of Department and the full faculty directory are maintained on the existing site and will be
            carried into this structure once the department pages are built out.
          </p>
        </section>
      </div>
    </>
  )
}

type Person = {
  name: string
  role: string
  photo: string
  email?: string
  phones?: string[]
  department?: string
  bio: string
  qualifications: string[]
}

function PersonCard({ person }: { person: Person }) {
  return (
    <article className="rounded-[var(--radius)] border border-line bg-card p-7">
      <div className="flex items-start gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.photo}
          alt={`Portrait of ${person.name}`}
          width={84}
          height={84}
          className="h-21 w-21 shrink-0 rounded-md object-cover object-top"
          style={{ height: 84, width: 84 }}
        />
        <div>
          <h3 className="text-[1.2rem]">{person.name}</h3>
          <p className="mt-0.5 text-[0.85rem] font-medium text-green-700">{person.role}</p>
          {person.department && <p className="mt-1 text-[0.8rem] text-ink-3">{person.department}</p>}
        </div>
      </div>

      <p className="mt-5 text-[0.88rem] leading-relaxed text-ink-2">{person.bio}</p>

      <ul className="mt-5 space-y-1 text-[0.78rem] text-ink-3">
        {person.qualifications.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-4 text-[0.82rem]">
        {person.email && (
          <a href={`mailto:${person.email}`} className="text-saffron-600 hover:underline">
            {person.email}
          </a>
        )}
        {person.phones?.map((p) => (
          <span key={p} className="text-ink-3">
            {p}
          </span>
        ))}
      </div>
    </article>
  )
}
