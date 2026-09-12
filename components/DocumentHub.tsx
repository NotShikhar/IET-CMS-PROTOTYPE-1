'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  documents,
  filterDocuments,
  facetCounts,
  KIND_LABELS,
  BRANCH_NAMES,
  type Doc,
  type DocKind,
} from '@/lib/content'

type FacetKey = 'kind' | 'programme' | 'branch' | 'year' | 'section'

const FACETS: { key: FacetKey; label: string; render: (v: string) => string }[] = [
  { key: 'kind', label: 'Type', render: (v) => KIND_LABELS[v as DocKind] ?? v },
  { key: 'programme', label: 'Programme', render: (v) => v },
  { key: 'branch', label: 'Branch', render: (v) => BRANCH_NAMES[v] ?? v },
  { key: 'year', label: 'Year', render: (v) => `${v} Year` },
  { key: 'section', label: 'Section', render: (v) => `Section ${v}` },
]

const FORMAT_LABEL: Record<string, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  jpg: 'Image',
  jpeg: 'Image',
  png: 'Image',
}

export default function DocumentHub() {
  const router = useRouter()
  const params = useSearchParams()

  const selected = useMemo(
    () => ({
      q: params.get('q') ?? '',
      kind: params.get('kind') ?? '',
      programme: params.get('programme') ?? '',
      branch: params.get('branch') ?? '',
      year: params.get('year') ?? '',
      section: params.get('section') ?? '',
    }),
    [params],
  )

  // The input is uncontrolled-ish: it leads, the URL follows after a beat, so typing stays smooth.
  const [query, setQuery] = useState(selected.q)
  const firstRender = useRef(true)

  useEffect(() => {
    setQuery(selected.q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.q])

  const push = useCallback(
    (next: Record<string, string>) => {
      const sp = new URLSearchParams()
      for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v)
      const qs = sp.toString()
      router.replace(qs ? `/resources?${qs}` : '/resources', { scroll: false })
    },
    [router],
  )

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (query === selected.q) return
    const t = setTimeout(() => push({ ...selected, q: query }), 220)
    return () => clearTimeout(t)
  }, [query, selected, push])

  const toggle = (key: FacetKey, value: string) =>
    push({ ...selected, q: query, [key]: selected[key] === value ? '' : value })

  const clearAll = () => {
    setQuery('')
    router.replace('/resources', { scroll: false })
  }

  const results = useMemo(() => filterDocuments(documents, { ...selected, q: query }), [selected, query])

  // Counts shown on a facet reflect every OTHER active filter, so a chip never reads "0"
  // for something that would in fact return results once you click it.
  const countsFor = useCallback(
    (key: FacetKey) => {
      const withoutThis = { ...selected, q: query, [key]: '' }
      return facetCounts(filterDocuments(documents, withoutThis), key)
    },
    [selected, query],
  )

  const activeCount = Object.entries(selected).filter(([k, v]) => k !== 'q' && v).length + (query ? 1 : 0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<DocKind, Doc[]>()
    for (const d of results) {
      if (!map.has(d.kind)) map.set(d.kind, [])
      map.get(d.kind)!.push(d)
    }
    return [...map.entries()].sort(
      (a, b) => Object.keys(KIND_LABELS).indexOf(a[0]) - Object.keys(KIND_LABELS).indexOf(b[0]),
    )
  }, [results])

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
      {/* -------------------------------------------------------- filters */}
      <aside className="lg:sticky lg:top-[110px] lg:self-start">
        <div className="flex items-center justify-between lg:block">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Filter</h2>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium lg:hidden"
          >
            {filtersOpen ? 'Hide' : 'Show'}
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-saffron px-1.5 text-[0.7rem] text-on-saffron">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className={`${filtersOpen ? 'block' : 'hidden'} mt-5 space-y-7 lg:mt-6 lg:block`}>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-saffron-600 underline underline-offset-4"
            >
              Clear all filters
            </button>
          )}

          {FACETS.map((facet) => {
            const counts = countsFor(facet.key)
            if (counts.length < 2) return null
            return (
              <fieldset key={facet.key} className="border-0 p-0">
                <legend className="mb-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
                  {facet.label}
                </legend>
                <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
                  {counts.map(({ value, count }) => {
                    const on = selected[facet.key] === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggle(facet.key, value)}
                        aria-pressed={on}
                        className={`flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[0.85rem] transition-colors ${
                          on
                            ? 'bg-green-700 text-on-green font-medium'
                            : 'text-ink-2 hover:bg-green-tint'
                        }`}
                      >
                        <span className="truncate">{facet.render(value)}</span>
                        <span className={`shrink-0 text-[0.75rem] tabular-nums ${on ? 'opacity-80' : 'text-ink-3'}`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
        </div>
      </aside>

      {/* -------------------------------------------------------- results */}
      <div>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search timetables, syllabi, roll lists…"
            aria-label="Search documents"
            className="w-full rounded-lg border border-line bg-card py-3.5 pl-12 pr-4 text-[0.95rem] shadow-[var(--shadow-sm)] outline-none transition-colors placeholder:text-ink-3 focus:border-green-600"
          />
        </div>

        <p className="mt-4 text-sm text-ink-3" role="status" aria-live="polite">
          {results.length === documents.length
            ? `${documents.length} documents`
            : `${results.length} of ${documents.length} documents`}
        </p>

        {results.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <p className="font-[family-name:var(--font-display)] text-xl">Nothing matches those filters</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
              Try removing a filter, or search for a branch code such as <em>IT</em> or a document type such as{' '}
              <em>roll list</em>.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-on-green"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-11">
            {grouped.map(([kind, docs]) => (
              <section key={kind} aria-labelledby={`group-${kind}`}>
                <div className="mb-4 flex items-baseline gap-3">
                  <h3
                    id={`group-${kind}`}
                    className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold"
                  >
                    {KIND_LABELS[kind]}
                  </h3>
                  <span className="text-[0.8rem] tabular-nums text-ink-3">{docs.length}</span>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {docs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentCard({ doc }: { doc: Doc }) {
  const chips = [
    doc.programme,
    doc.branch ? BRANCH_NAMES[doc.branch] ?? doc.branch : undefined,
    doc.year ? `${doc.year} Year` : undefined,
    doc.semester ? `Sem ${doc.semester}` : undefined,
    doc.section ? `Section ${doc.section}` : undefined,
  ].filter(Boolean) as string[]

  return (
    <li>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full gap-3.5 rounded-[var(--radius)] border border-line bg-card p-4 transition-all hover:border-green-600 hover:shadow-[var(--shadow-md)]"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-tint text-[0.62rem] font-bold tracking-tight text-green-700"
        >
          {FORMAT_LABEL[doc.format] ?? doc.format.toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.92rem] font-medium leading-snug text-ink group-hover:text-green-700">
            {doc.title}
          </span>
          {chips.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded border border-line bg-paper-2 px-1.5 py-0.5 text-[0.68rem] text-ink-3"
                >
                  {c}
                </span>
              ))}
            </span>
          )}
          {doc.note && <span className="mt-1.5 block text-[0.75rem] text-ink-3">{doc.note}</span>}
        </span>
      </a>
    </li>
  )
}
