import Link from 'next/link'
import Image from 'next/image'
import { site } from '@/lib/content'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t-[3px] border-gold bg-paper-2 text-ink">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3.5">
              <Image
                src="/media/brand/iet-crest.png"
                alt=""
                width={52}
                height={52}
                className="h-13 w-13 object-contain"
              />
              <div className="leading-tight">
                <p className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold">
                  {site.name}
                </p>
                <p className="text-[0.78rem] text-ink-3">{site.parent}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[0.88rem] leading-relaxed text-ink-2">
              {site.motto} — &ldquo;{site.mottoMeaning}&rdquo;
            </p>
            <address className="mt-6 space-y-1 text-[0.88rem] not-italic text-ink-2">
              <p>{site.address.line1}, {site.address.line2}</p>
              <p>
                {site.address.city} — {site.address.pin}, {site.address.state}
              </p>
              <p className="pt-2">{site.phones.join(' · ')}</p>
              <p>
                <a className="text-green-700 underline decoration-gold underline-offset-4" href={`mailto:${site.emails.director}`}>
                  {site.emails.director}
                </a>
              </p>
            </address>
          </div>

          <FooterColumn title="Academics" links={site.quickLinks.slice(4)} />
          <FooterColumn title="Students" links={site.quickLinks.slice(0, 4)} />

          <div>
            <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.13em] text-saffron-600">
              Elsewhere
            </h2>
            <ul className="mt-5 space-y-2.5 text-[0.88rem]">
              {site.externalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-2 transition-colors hover:text-green-700"
                  >
                    {l.label} <span aria-hidden="true" className="opacity-50">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-7 text-[0.8rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Institute of Engineering &amp; Technology, DAVV Indore. All rights reserved.</p>
          <p>
            Prototype — content mirrored from ietdavv.edu.in.{' '}
            <a className="text-green-700 underline underline-offset-4" href={`mailto:${site.emails.webmaster}`}>
              {site.emails.webmaster}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.13em] text-saffron-600">{title}</h2>
      <ul className="mt-5 space-y-2.5 text-[0.88rem]">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-ink-2 transition-colors hover:text-green-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
