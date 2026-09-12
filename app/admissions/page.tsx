import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { admissions, site, documents, programmes } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Admissions 2026-27',
  description:
    'Admission to B.Tech, B.Design, M.Tech and MBA programmes at IET DAVV Indore for the 2026-27 session, with brochures, FAQs and scholarship information.',
}

export default function AdmissionsPage() {
  const docs = documents.filter((d) => d.kind === 'admission')
  const byProgramme = new Map<string, typeof docs>()
  for (const d of docs) {
    const key = d.programme ?? 'Other'
    if (!byProgramme.has(key)) byProgramme.set(key, [])
    byProgramme.get(key)!.push(d)
  }

  return (
    <>
      <PageHero
        eyebrow={`Session ${admissions.session}`}
        title={`Admissions ${admissions.session}`}
        standfirst={admissions.intro}
        crumb="Admissions"
      />

      <div className="shell py-16 md:py-20">
        {/* ------------------------------------------------------ the tracks */}
        <section>
          <h2 className="text-[1.8rem] md:text-[2.1rem]">What&rsquo;s open</h2>
          <div className="rule-gold mt-4" />
          <div className="mt-9 grid gap-3 md:grid-cols-2">
            {admissions.tracks.map((t) => {
              const files = byProgramme.get(t.programme.replace(/\s*Programs?$/i, '').trim()) ?? []
              const matched = docs.filter((d) => t.programme.toLowerCase().includes((d.programme ?? '').toLowerCase().slice(0, 5)))
              const list = files.length ? files : matched
              return (
                <article
                  key={t.programme}
                  className="rounded-[var(--radius)] border border-line bg-card p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[1.3rem]">{t.programme}</h3>
                      <p className="mt-1 text-[0.82rem] text-ink-3">{t.note}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2.5 py-1 text-[0.7rem] font-semibold ${
                        t.status === 'open'
                          ? 'bg-green-tint text-green-700'
                          : 'border border-dashed border-line-2 text-ink-3'
                      }`}
                    >
                      {t.status === 'open' ? 'Open' : 'Coming soon'}
                    </span>
                  </div>

                  {list.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {list.map((d) => (
                        <li key={d.id}>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper-2 px-3 py-1.5 text-[0.82rem] font-medium transition-colors hover:border-green-600 hover:text-green-700"
                          >
                            {d.title.split('·').pop()?.trim()}
                            <span aria-hidden="true" className="text-[0.7rem] text-ink-3">
                              {d.format.toUpperCase()}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-[0.82rem] text-ink-3">Documents will be published shortly.</p>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {/* -------------------------------------------------------- contact */}
        <section className="mt-16 rounded-[var(--radius)] bg-green-900 p-8 text-on-green md:p-11">
          <h2 className="text-[1.6rem] text-on-green">Talk to the admission cell</h2>
          <p className="mt-3 max-w-xl text-[0.95rem] opacity-80">
            For anything the brochures don&rsquo;t answer — eligibility, documents, counselling dates or fee
            queries — call any of the numbers below.
          </p>
          <ul className="mt-7 flex flex-wrap gap-3">
            {site.admissionContacts.map((c) => (
              <li key={c}>
                <a
                  href={`tel:${c.replace(/\s/g, '')}`}
                  className="block rounded-md border border-white/25 px-5 py-3 font-[family-name:var(--font-display)] text-[1.15rem] transition-colors hover:bg-white/10"
                >
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------- scholarships */}
        <section id="scholarships" className="mt-20 scroll-mt-28">
          <p className="eyebrow">Financial support</p>
          <div className="rule-gold mt-3.5" />
          <h2 className="mt-5 text-[1.8rem] md:text-[2.1rem]">Scholarships</h2>
          <p className="mt-4 max-w-3xl text-[0.98rem] leading-relaxed text-ink-2">
            {admissions.scholarships.intro}
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <ScholarshipList title="State Government schemes" items={admissions.scholarships.state} />
            <ScholarshipList title="Central Government &amp; AICTE schemes" items={admissions.scholarships.central} />
          </div>
        </section>

        {/* ------------------------------------------------------- next steps */}
        <section className="mt-20 border-t border-line pt-12">
          <h2 className="text-[1.5rem]">Before you apply</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <NextStep
              href="/programmes"
              title="Browse the programmes"
              detail={`All ${programmes.reduce((a, g) => a + g.items.length, 0)} programmes across six awards.`}
            />
            <NextStep
              href="/resources?kind=syllabus"
              title="Read the syllabus"
              detail="Scheme and syllabus documents under the CBCS structure."
            />
            <NextStep
              href="/resources?kind=disclosure"
              title="Statutory disclosures"
              detail="AICTE mandatory disclosure, EOAs and anti-ragging regulations."
            />
          </div>
        </section>
      </div>
    </>
  )
}

function ScholarshipList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-saffron-600">
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5">
        {items.map((s) => (
          <li
            key={s}
            className="flex gap-3 border-b border-line pb-2.5 text-[0.92rem] text-ink-2 last:border-0"
          >
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NextStep({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius)] border border-line bg-card p-6 transition-all hover:border-green-600 hover:shadow-[var(--shadow-md)]"
    >
      <p className="text-[1.02rem] font-medium group-hover:text-green-700">{title}</p>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-3">{detail}</p>
    </Link>
  )
}
