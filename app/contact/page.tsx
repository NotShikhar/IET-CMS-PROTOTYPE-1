import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import { contact, site } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Institute of Engineering & Technology, DAVV — Khandwa Road, Indore 452017.',
}

export default function ContactPage() {
  const mapQuery = encodeURIComponent('Institute of Engineering and Technology DAVV Khandwa Road Indore')

  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact" standfirst={contact.intro} crumb="Contact" />

      <div className="shell py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="text-[1.5rem]">Where we are</h2>
            <div className="rule-gold mt-4" />
            <address className="mt-6 text-[1.05rem] not-italic leading-relaxed text-ink-2">
              {site.name}
              <br />
              {site.parent}
              <br />
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city} — {site.address.pin}
              <br />
              {site.address.state}, {site.address.country}
            </address>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {site.phones.map((p) => (
                <a
                  key={p}
                  href={`tel:${p.replace(/[^\d+]/g, '')}`}
                  className="font-[family-name:var(--font-display)] text-[1.3rem] text-green-700 hover:underline"
                >
                  {p}
                </a>
              ))}
            </div>

            <h3 className="mt-12 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-saffron-600">
              Getting here
            </h3>
            <ul className="mt-5 space-y-5">
              {contact.directions.map((d) => (
                <li key={d.from}>
                  <p className="text-[0.95rem] font-medium">From {d.from}</p>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-2">{d.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[1.5rem]">Who to contact</h2>
            <div className="rule-gold mt-4" />
            <dl className="mt-6 divide-y divide-line">
              {contact.offices.map((o) => (
                <div key={o.name} className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-4">
                  <dt className="text-[0.88rem] font-medium text-ink">{o.name}</dt>
                  <dd className="text-[0.88rem] leading-relaxed text-ink-2">{o.contact}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 overflow-hidden rounded-[var(--radius)] border border-line">
              <iframe
                title="Map showing the location of IET DAVV on Khandwa Road, Indore"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%"
                height="340"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
