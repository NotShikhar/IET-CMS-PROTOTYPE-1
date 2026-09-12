'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { site, type NavItem } from '@/lib/content'

export default function SiteHeader() {
  const pathname = usePathname()
  const [openTop, setOpenTop] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setOpenTop(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Escape closes, and a click anywhere outside the bar dismisses an open menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenTop(null)
        setMobileOpen(false)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenTop(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  // A short grace period on leaving, so a diagonal mouse path to a submenu doesn't close it.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenTop(null), 180)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      const base = item.href.split(/[?#]/)[0]
      if (base === '/') return pathname === '/'
      return pathname === base || pathname.startsWith(base + '/')
    }
    return (item.children ?? []).some(isActive)
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Identity strip — the university above the institute, as on the crest. */}
      <div className="hidden bg-green-800 text-on-green md:block">
        <div className="shell flex h-9 items-center justify-between text-[0.74rem]">
          <p className="tracking-wide opacity-90">
            {site.parent} &nbsp;·&nbsp; <span className="opacity-75">{site.motto}</span>
          </p>
          <div className="flex items-center gap-5 opacity-90">
            {site.accreditation.slice(0, 3).map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-card shadow-[0_1px_0_rgba(11,59,44,0.04)]">
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.shortName} home`}>
            <Image
              src="/media/brand/iet-crest.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 object-contain"
              priority
            />
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-display)] text-[0.98rem] font-semibold tracking-tight text-ink">
                Institute of Engineering &amp; Technology
              </span>
              <span className="block text-[0.7rem] tracking-wide text-ink-3">
                Devi Ahilya Vishwavidyalaya, Indore
              </span>
            </span>
          </Link>

          <nav ref={navRef} className="hidden items-center xl:flex" aria-label="Primary">
            {site.nav.map((item) => {
              const active = isActive(item)
              const hasKids = Boolean(item.children?.length)
              const open = openTop === item.label

              if (!hasKids) {
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? '#'}
                    aria-current={active ? 'page' : undefined}
                    className={`relative whitespace-nowrap rounded px-2.5 py-2 text-[0.82rem] font-semibold transition-colors ${
                      active ? 'text-green-700' : 'text-ink-2 hover:text-green-700'
                    }`}
                  >
                    {item.label}
                    {active && <span className="absolute inset-x-2.5 bottom-0.5 h-[2px] rounded-full bg-saffron" />}
                  </Link>
                )
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    cancelClose()
                    setOpenTop(item.label)
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenTop(open ? null : item.label)}
                    className={`relative flex items-center gap-1 whitespace-nowrap rounded px-2.5 py-2 text-[0.82rem] font-semibold transition-colors ${
                      active || open ? 'text-green-700' : 'text-ink-2 hover:text-green-700'
                    }`}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-[0.95em] font-normal leading-none opacity-70">
                      +
                    </span>
                    {active && <span className="absolute inset-x-2.5 bottom-0.5 h-[2px] rounded-full bg-saffron" />}
                  </button>
                  {open && <Dropdown items={item.children!} level={0} />}
                </div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admissions"
              className="hidden rounded bg-saffron px-4 py-2 text-[0.82rem] font-bold text-on-saffron transition-colors hover:bg-saffron-600 hover:text-white xl:inline-block"
            >
              Apply
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="flex h-10 w-10 items-center justify-center rounded border border-line text-ink xl:hidden"
            >
              <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                {mobileOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && <MobileNav items={site.nav} />}
    </header>
  )
}

/** Desktop dropdown. Level 0 hangs below the bar; deeper levels fly out to the side. */
function Dropdown({ items, level }: { items: NavItem[]; level: number }) {
  const [openChild, setOpenChild] = useState<string | null>(null)

  return (
    <ul
      className={`absolute z-50 min-w-[250px] border border-line bg-card py-1.5 shadow-[var(--shadow-lg)] ${
        level === 0 ? 'left-0 top-full' : 'left-full top-0 -mt-1.5'
      }`}
    >
      {items.map((child) => {
        const hasKids = Boolean(child.children?.length)
        const open = openChild === child.label
        return (
          <li
            key={child.label}
            className="relative"
            onMouseEnter={() => setOpenChild(hasKids ? child.label : null)}
            onMouseLeave={() => setOpenChild(null)}
          >
            {hasKids ? (
              <>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenChild(open ? null : child.label)}
                  className={`flex w-full items-center justify-between gap-6 px-5 py-2.5 text-left text-[0.86rem] transition-colors ${
                    open ? 'bg-green-tint text-green-700' : 'text-ink-2 hover:bg-green-tint hover:text-green-700'
                  }`}
                >
                  <span>{child.label}</span>
                  <span aria-hidden="true" className="opacity-60">
                    +
                  </span>
                </button>
                {open && <Dropdown items={child.children!} level={level + 1} />}
              </>
            ) : (
              <Link
                href={child.href ?? '#'}
                className="block px-5 py-2.5 text-[0.86rem] text-ink-2 transition-colors hover:bg-green-tint hover:text-green-700"
              >
                {child.label}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Mobile: the same tree, as nested accordions. */
function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <div
      id="mobile-nav"
      className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto border-t border-line bg-paper xl:hidden"
    >
      <nav className="shell py-3" aria-label="Primary (mobile)">
        <ul>
          {items.map((item) => (
            <MobileItem key={item.label} item={item} depth={0} />
          ))}
        </ul>
        <Link
          href="/admissions"
          className="mt-6 block rounded bg-saffron px-5 py-3.5 text-center font-bold text-on-saffron"
        >
          Apply for 2026-27
        </Link>
        <div className="mb-10 mt-7 space-y-1.5 text-[0.85rem] text-ink-3">
          <p>
            {site.address.line1}, {site.address.city} — {site.address.pin}
          </p>
          <p>{site.phones.join(' · ')}</p>
        </div>
      </nav>
    </div>
  )
}

function MobileItem({ item, depth }: { item: NavItem; depth: number }) {
  const [open, setOpen] = useState(false)
  const hasKids = Boolean(item.children?.length)

  if (!hasKids) {
    return (
      <li>
        <Link
          href={item.href ?? '#'}
          className={`block border-b border-line py-3 ${
            depth === 0
              ? 'font-[family-name:var(--font-display)] text-[1.15rem] text-ink'
              : 'text-[0.92rem] text-ink-2'
          }`}
          style={{ paddingLeft: depth * 16 }}
        >
          {item.label}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-4 border-b border-line py-3 text-left ${
          depth === 0
            ? 'font-[family-name:var(--font-display)] text-[1.15rem] text-ink'
            : 'text-[0.92rem] text-ink-2'
        }`}
        style={{ paddingLeft: depth * 16 }}
      >
        <span>{item.label}</span>
        <span aria-hidden="true" className={`text-ink-3 transition-transform ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <ul className="bg-paper-2/60">
          {item.children!.map((c) => (
            <MobileItem key={c.label} item={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
