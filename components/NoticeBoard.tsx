'use client'

import { useState } from 'react'
import { notices } from '@/lib/content'

const TABS = [
  { key: 'latest', label: 'Latest' },
  { key: 'exam', label: 'Examination' },
  { key: 'tender', label: 'Tenders' },
] as const

export default function NoticeBoard({ limit }: { limit?: number }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('latest')
  const list = notices.filter((n) => n.categories.includes(tab))
  const shown = limit ? list.slice(0, limit) : list

  return (
    <div>
      <div role="tablist" aria-label="Notice categories" className="flex gap-1 border-b border-line">
        {TABS.map((t) => {
          const on = tab === t.key
          const n = notices.filter((x) => x.categories.includes(t.key)).length
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2.5 text-[0.875rem] font-medium transition-colors ${
                on ? 'text-green-700' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[0.72rem] tabular-nums opacity-60">{n}</span>
              {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-saffron" />}
            </button>
          )
        })}
      </div>

      <ul className="divide-y divide-line">
        {shown.map((n) => (
          <li key={n.id}>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 py-3.5 transition-colors hover:bg-green-tint/50"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-line bg-paper-2 leading-none"
              >
                <span className="text-[0.95rem] font-semibold text-ink">{n.day}</span>
                <span className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-ink-3">{n.month}</span>
              </span>
              <span className="min-w-0 flex-1 pt-0.5 text-[0.9rem] leading-snug text-ink-2 group-hover:text-green-700">
                {n.title}
              </span>
              <span aria-hidden="true" className="pt-1 text-ink-3 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      {shown.length === 0 && <p className="py-8 text-sm text-ink-3">No notices in this category.</p>}
    </div>
  )
}
