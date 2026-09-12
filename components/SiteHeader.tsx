'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/lib/content'

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the mobile sheet on navigation.
  useEffect(() => setOpen(false), [pathname])

  // Lock the page behind the open sheet.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50">
      {/* Identity strip — the university above the institute, as on the crest. */}
      <div className="hidden bg-green-900 text-on-green md:block">
        <div className="shell flex h-9 items-center justify-between text-[0.74rem]">
          <p className="tracking-wide opacity-85">
            {site.parent} &nbsp;·&nbsp; <span className="opacity-70">{site.motto}</span>
          </p>
          <div className="flex items-center gap-5 opacity-85">
            {site.accreditation.slice(0, 3).map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-card/95 backdrop-blur-md">
        <div className="shell flex h-[74px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3.5" aria-label={`${site.shortName} home`}>
            <Image
              src="/media/brand/iet-crest.png"
              alt=""
              width={46}
              height={46}
              className="h-[46px] w-[46px] shrink-0 object-contain"
              priority
            />
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-display)] text-[1.02rem] font-semibold tracking-tight text-ink">
                Institute of Engineering &amp; Technology
              </span>
              <span className="block text-[0.72rem] tracking-wide text-ink-3">
                Devi Ahilya Vishwavidyalaya, Indore
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {site.nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-md px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                    active
                      ? 'text-green-700'
                      : 'text-ink-2 hover:bg-green-tint hover:text-green-700'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-saffron" />
                  )}
                </Link>
              )
            })}
            <Link
              href="/admissions"
              className="ml-3 rounded-md bg-saffron px-4 py-2 text-[0.875rem] font-semibold text-on-saffron transition-colors hover:bg-saffron-600 hover:text-white"
            >
              Apply
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-[74px] overflow-y-auto border-t border-line bg-paper lg:hidden"
        >
          <nav className="shell py-5" aria-label="Primary (mobile)">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-line py-3.5 font-[family-name:var(--font-display)] text-[1.35rem] text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admissions"
              className="mt-6 block rounded-md bg-saffron px-5 py-3.5 text-center font-semibold text-on-saffron"
            >
              Apply for 2026-27
            </Link>
            <div className="mt-7 space-y-1.5 text-[0.85rem] text-ink-3">
              <p>{site.address.line1}, {site.address.city} — {site.address.pin}</p>
              <p>{site.phones.join(' · ')}</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
