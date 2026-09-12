import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/PageHero'
import { about, people, site } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About',
  description:
    'The Institute of Engineering & Technology, DAVV Indore — history, vision and mission, and messages from the Director and Vice Chancellor.',
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        standfirst={about.hero.standfirst}
        crumb="About"
      />

      {/* ---------------------------------------------------------- IET */}
      <section className="shell py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-[1.9rem] md:text-[2.2rem]">{about.iet.title}</h2>
            <div className="rule-gold mt-4" />
            <div className="prose-block mt-7">
              {about.iet.body.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
          <aside className="lg:pt-3">
            <div className="card p-7">
              <h3 className="text-[1.1rem]">At a glance</h3>
              <dl className="mt-5 space-y-4 text-[0.88rem]">
                <Fact label="Established" value={site.established} />
                <Fact label="Parent university" value={site.parent} />
                <Fact label="Campus" value="Vikramshila Parisar, Khandwa Road, Indore" />
                <Fact label="Status" value={site.accreditation.join(' · ')} />
                <Fact label="Motto" value={`${site.motto} — “${site.mottoMeaning}”`} />
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------- vision & mission */}
      <section className="border-y border-line bg-paper-2">
        <div className="shell grid gap-14 py-20 lg:grid-cols-2 lg:gap-20">
          <VisionMission
            title={about.visionMissionIET.title}
            vision={about.visionMissionIET.vision}
            missionIntro={about.visionMissionIET.missionIntro}
            mission={about.visionMissionIET.mission}
          />
          <VisionMission
            title={about.visionMissionDAVV.title}
            vision={about.visionMissionDAVV.vision}
            mission={about.visionMissionDAVV.mission}
          />
        </div>
      </section>

      {/* -------------------------------------------------- director's word */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[320px_1fr] lg:gap-20">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] border border-line">
              <Image
                src={people.director.photo}
                alt={`Portrait of ${people.director.name}`}
                fill
                sizes="320px"
                className="object-cover object-top"
              />
            </div>
            <p className="mt-5 font-[family-name:var(--font-display)] text-[1.2rem] font-semibold">
              {people.director.name}
            </p>
            <p className="text-[0.85rem] text-ink-3">{people.director.role}, IET DAVV</p>
            <p className="mt-1 text-[0.8rem] text-ink-3">{people.director.department}</p>
            <ul className="mt-5 space-y-1.5 text-[0.78rem] text-ink-3">
              {people.director.qualifications.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">{about.directorMessage.title}</p>
            <div className="rule-gold mt-3.5" />
            <p className="mt-6 font-[family-name:var(--font-display)] text-[1.5rem] leading-snug md:text-[1.85rem]">
              {about.directorMessage.salutation}
            </p>
            <div className="prose-block mt-6">
              {about.directorMessage.body.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="mt-8 text-[0.9rem] italic text-ink-2">{about.directorMessage.signoff}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">
              {people.director.name}
            </p>
            <p className="text-[0.82rem] text-ink-3">
              Director, {site.name}, {site.parent}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- DAVV */}
      <section className="border-y border-line bg-paper-2">
        <div className="shell grid gap-14 py-20 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div className="flex items-start">
            <Image
              src="/media/brand/davv-crest.png"
              alt="Crest of Devi Ahilya Vishwavidyalaya"
              width={200}
              height={200}
              className="h-auto w-[180px] object-contain"
            />
          </div>
          <div>
            <h2 className="text-[1.9rem] md:text-[2.2rem]">{about.davv.title}</h2>
            <div className="rule-gold mt-4" />
            <div className="prose-block mt-7">
              {about.davv.body.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- VC word */}
      <section className="shell py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{about.vcMessage.title}</p>
          <div className="rule-gold mt-3.5" />
          <div className="prose-block mt-7">
            {about.vcMessage.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <p className="mt-7 text-[0.85rem] text-ink-3">
            Vice Chancellor, Devi Ahilya Vishwavidyalaya, Indore
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- milestones */}
      <section className="border-t border-line bg-paper-2">
        <div className="shell py-20">
          <p className="eyebrow">Milestones</p>
          <div className="rule-gold mt-3.5" />
          <h2 className="mt-5 text-[1.9rem] md:text-[2.2rem]">Six decades in the making</h2>
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {about.milestones.map((m) => (
              <li key={m.year} className="border-t-2 border-gold pt-5">
                <p className="font-[family-name:var(--font-display)] text-[1.7rem] font-semibold text-green-700">
                  {m.year}
                </p>
                <p className="mt-1.5 text-[0.98rem] font-medium">{m.title}</p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-2">{m.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line pb-4 last:border-0 last:pb-0">
      <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-3">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  )
}

function VisionMission({
  title,
  vision,
  missionIntro,
  mission,
}: {
  title: string
  vision: string
  missionIntro?: string
  mission: string[]
}) {
  return (
    <div>
      <h2 className="text-[1.6rem]">{title}</h2>
      <div className="rule-gold mt-4" />
      <h3 className="mt-7 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-saffron-600">
        Vision
      </h3>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{vision}</p>
      <h3 className="mt-8 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-saffron-600">
        Mission
      </h3>
      {missionIntro && <p className="mt-3 text-[0.92rem] text-ink-2">{missionIntro}</p>}
      <ul className="mt-4 space-y-3">
        {mission.map((m) => (
          <li key={m.slice(0, 30)} className="flex gap-3 text-[0.92rem] leading-relaxed text-ink-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}
