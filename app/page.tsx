import Link from 'next/link'
import Image from 'next/image'
import { site, stats, about, programmes, campus, documents, KIND_LABELS, type DocKind } from '@/lib/content'
import NoticeBoard from '@/components/NoticeBoard'

const HUB_SHORTCUTS: { kind: DocKind; blurb: string }[] = [
  { kind: 'class-timetable', blurb: 'Weekly teaching schedule by branch, year and section' },
  { kind: 'exam-timetable', blurb: 'Theory and practical examination schedules' },
  { kind: 'syllabus', blurb: 'Scheme and syllabus under the CBCS structure' },
  { kind: 'roll-list', blurb: 'Enrolment lists for the current session' },
]

export default function HomePage() {
  const counts = Object.fromEntries(
    Object.keys(KIND_LABELS).map((k) => [k, documents.filter((d) => d.kind === k).length]),
  ) as Record<DocKind, number>

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden bg-green-900 text-on-green">
        <Image
          src="/media/campus/academic-block.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.55]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-900/85 to-green-900/25"
        />
        <div className="shell relative py-20 md:py-32">
          <div className="max-w-2xl rise">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold">
              Devi Ahilya Vishwavidyalaya · Indore
            </p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.06] text-on-green md:text-[4.1rem]">
              Knowledge meets innovation
            </h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed opacity-85 md:text-[1.15rem]">
              Since 1996, the Institute of Engineering &amp; Technology has grown from ninety students to more
              than nine hundred a year — across nine engineering branches, seven postgraduate specialisations
              and eight doctoral streams.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/admissions"
                className="rounded-md bg-saffron px-6 py-3 font-semibold text-on-saffron transition-colors hover:bg-saffron-600 hover:text-white"
              >
                Admissions 2026-27
              </Link>
              <Link
                href="/resources"
                className="rounded-md border border-white/25 px-6 py-3 font-medium text-on-green backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Find a document
              </Link>
            </div>
            <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem] opacity-70">
              {site.accreditation.map((a) => (
                <span key={a} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
                  {a}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- notices + search */}
      <section className="border-b border-line bg-card">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[1.6rem]">Notices</h2>
              <Link href="/notices" className="text-[0.85rem] font-medium text-saffron-600 hover:underline">
                All notices →
              </Link>
            </div>
            <div className="mt-5">
              <NoticeBoard limit={6} />
            </div>
          </div>

          <div>
            <h2 className="text-[1.6rem]">Find what you need</h2>
            <p className="mt-3 max-w-md text-[0.95rem] text-ink-2">
              Every timetable, syllabus, roll list and form the institute publishes — {documents.length} documents,
              in one searchable place.
            </p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {HUB_SHORTCUTS.map((s) => (
                <Link
                  key={s.kind}
                  href={`/resources?kind=${s.kind}`}
                  className="group rounded-[var(--radius)] border border-line bg-paper-2 p-4 transition-all hover:border-green-600 hover:bg-card hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[0.92rem] font-medium group-hover:text-green-700">
                      {KIND_LABELS[s.kind]}
                    </span>
                    <span className="shrink-0 text-[0.75rem] tabular-nums text-ink-3">
                      {counts[s.kind]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.78rem] leading-snug text-ink-3">{s.blurb}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/resources"
              className="mt-4 inline-block text-[0.85rem] font-medium text-saffron-600 hover:underline"
            >
              Browse all {documents.length} documents →
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ about */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
            <Image
              src="/media/campus/computer-engineering-dept.jpg"
              alt="The Department of Computer Engineering building on the IET campus"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">About the institute</p>
            <div className="rule-gold mt-3.5" />
            <h2 className="mt-5 text-[2rem] md:text-[2.5rem]">
              One of Central India&rsquo;s most reputed engineering institutes
            </h2>
            <div className="prose-block mt-6">
              {about.iet.body.slice(0, 2).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <Link
              href="/about"
              className="mt-7 inline-block rounded-md border border-line-2 px-6 py-3 text-[0.9rem] font-medium transition-colors hover:border-green-600 hover:bg-green-tint hover:text-green-700"
            >
              Read more about IET
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="border-y border-line bg-paper-2">
        <div className="shell py-16 md:py-20">
          <h2 className="sr-only">The institute in numbers</h2>
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-[family-name:var(--font-display)] text-[2.4rem] font-semibold leading-none text-green-700">
                    {s.value}
                  </span>
                  <span className="mt-2.5 block text-[0.92rem] font-medium text-ink">{s.label}</span>
                  <span className="mt-1.5 block text-[0.8rem] leading-snug text-ink-3">{s.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- programmes */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">What we teach</p>
            <div className="rule-gold mt-3.5" />
            <h2 className="mt-5 text-[2rem] md:text-[2.5rem]">Twenty-seven programmes</h2>
          </div>
          <Link
            href="/programmes"
            className="text-[0.88rem] font-medium text-saffron-600 hover:underline"
          >
            All programmes →
          </Link>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map((g) => (
            <Link
              key={`${g.award}-${g.mode}`}
              href="/programmes"
              className="group flex flex-col rounded-[var(--radius)] border border-line bg-card p-6 transition-all hover:border-green-600 hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.3rem] group-hover:text-green-700">{g.award}</h3>
                <span className="rounded border border-line bg-paper-2 px-2 py-0.5 text-[0.68rem] text-ink-3">
                  {g.mode}
                </span>
              </div>
              <p className="mt-3 flex-1 text-[0.86rem] leading-relaxed text-ink-2">{g.blurb}</p>
              <p className="mt-5 text-[0.78rem] font-medium text-ink-3">
                {g.items.length} {g.items.length === 1 ? 'programme' : 'programmes'} · {g.duration}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- campus life */}
      <section className="bg-green-900 py-20 text-on-green md:py-28">
        <div className="shell">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold">
            Beyond the classroom
          </p>
          <h2 className="mt-4 max-w-2xl text-[2rem] text-on-green md:text-[2.6rem]">{campus.standfirst}</h2>

          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {campus.gallery.slice(0, 8).map((g, i) => (
              <figure
                key={g.src}
                className={`relative overflow-hidden rounded-[var(--radius)] ${
                  i === 0 || i === 5 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'
                }`}
              >
                <Image
                  src={g.src}
                  alt={g.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ quick links */}
      <section className="shell py-20">
        <h2 className="text-[1.6rem]">Quick links</h2>
        <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {site.quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group flex items-center justify-between gap-3 rounded-[var(--radius)] border border-line bg-card px-4 py-3.5 text-[0.88rem] transition-all hover:border-green-600 hover:shadow-[var(--shadow-sm)]"
            >
              <span className="group-hover:text-green-700">{l.label}</span>
              <span aria-hidden="true" className="text-ink-3 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
