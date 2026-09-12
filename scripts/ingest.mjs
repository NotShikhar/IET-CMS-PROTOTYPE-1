#!/usr/bin/env node
/**
 * Pulls every piece of content off the live WordPress site into typed JSON under content/,
 * and mirrors the genuine IET images into public/media.
 *
 * The interesting part is buildDocuments(): the source site keeps ~200 PDFs inside eight wide
 * HTML tables whose link text is almost always the single word "Download". Meaning lives in the
 * table's *geometry* — the row label says which branch, the column header says which year, the
 * cell position says which section. So we expand each table into a real grid (honouring
 * rowspan/colspan) and read the facets back off the axes.
 *
 *   npm run ingest
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WP = 'https://ietdavv.edu.in/ietnew'
const API = `${WP}/wp-json/wp/v2`
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const CACHE = path.join(ROOT, 'scripts/.cache')

const log = (...a) => console.log('  ', ...a)

/* ------------------------------------------------------------------ fetching */

async function get(url, { json = false, binary = false } = {}) {
  const key = path.join(CACHE, encodeURIComponent(url).slice(0, 180).replace(/%/g, '_'))
  if (existsSync(key)) {
    const buf = await readFile(key)
    return binary ? buf : json ? JSON.parse(buf.toString('utf8')) : buf.toString('utf8')
  }
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(CACHE, { recursive: true })
  await writeFile(key, buf)
  return binary ? buf : json ? JSON.parse(buf.toString('utf8')) : buf.toString('utf8')
}

/* -------------------------------------------------------------- html helpers */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'", '#39': "'", apos: "'",
  nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', hellip: '…', amp_: '&',
}
const decode = (s = '') =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })

const strip = (s = '') => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

/** Text with paragraph structure preserved, for prose blocks. */
function richText(html = '') {
  let s = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
  s = s.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = decode(s.replace(/<[^>]+>/g, ''))
  return s
    .split('\n')
    .map((l) => l.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
}

const linksIn = (html = '') =>
  [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: decode(m[1]),
    text: strip(m[2]),
  }))

const isDoc = (href) => /\.(pdf|docx?|xlsx?|jpe?g|png)(\?|$)/i.test(href)

/**
 * Expand an HTML table into a dense 2-D grid, honouring rowspan/colspan so that a cell
 * covered by a span above it reports the spanning cell. Without this, "Computer Engineering"
 * (which rowspans over its Section A and Section B rows) would only be visible on one row.
 */
function tableGrid(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1])
  const grid = []
  const taken = new Set()
  rows.forEach((rowHtml, r) => {
    if (!grid[r]) grid[r] = []
    let c = 0
    for (const m of rowHtml.matchAll(/<(t[dh])([^>]*)>([\s\S]*?)<\/\1>/gi)) {
      const [, , attrs, inner] = m
      while (taken.has(`${r},${c}`)) c++
      const rowspan = Math.min(30, Number(/rowspan\s*=\s*"?(\d+)/i.exec(attrs)?.[1] ?? 1))
      const colspan = Math.min(30, Number(/colspan\s*=\s*"?(\d+)/i.exec(attrs)?.[1] ?? 1))
      const all = linksIn(inner)
      const cell = {
        text: strip(inner),
        links: all.filter((l) => isDoc(l.href) || /^https?:/.test(l.href)),
        allLinks: all, // includes href="#" placeholders, which we need in order to spot dead links
      }
      for (let dr = 0; dr < rowspan; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          taken.add(`${r + dr},${c + dc}`)
          if (!grid[r + dr]) grid[r + dr] = []
          // Only the originating cell owns its links; spanned copies keep the label but not the file.
          grid[r + dr][c + dc] =
            dr === 0 && dc === 0 ? cell : { text: cell.text, links: [], allLinks: [], spanned: true }
        }
      }
      c += colspan
    }
  })
  return grid
}

const tablesIn = (html) => [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0])

/* ------------------------------------------------------------ normalisation */

// Order matters: CSBS must win before the looser "computer science" rule.
const BRANCHES = [
  [/computer science and business|\bCSBS\b/i, 'CSBS'],
  [/industrial production|\bIP\b/i, 'IP'],
  [/electrical and electronics|\bEEE\b/i, 'EEE'],
  [/telecommunication|E\s*&\s*TC|\bETC\b/i, 'ETC'],
  [/instrumentation|E\s*&\s*I\b|\bEI\b/i, 'EI'],
  [/computer (engineering|science)|\bCSE?\b/i, 'CSE'],
  [/information technology|\bIT\b/i, 'IT'],
  [/mechanical|\bMech\b/i, 'ME'],
  [/civil/i, 'CE'],
  [/applied (science|physics|chemistry|math)|mathematic/i, 'Applied Science'],
]

const BRANCH_NAMES = {
  CSE: 'Computer Engineering',
  IT: 'Information Technology',
  ETC: 'Electronics & Telecommunication Engineering',
  EI: 'Electronics & Instrumentation Engineering',
  ME: 'Mechanical Engineering',
  CE: 'Civil Engineering',
  CSBS: 'Computer Science and Business Systems',
  IP: 'Industrial Production',
  EEE: 'Electrical and Electronics Engineering',
  'Applied Science': 'Applied Science',
}

/**
 * Every branch named in a string. Patterns are applied in priority order and each match is
 * consumed, so "Computer Science and Business Systems" resolves to CSBS alone — the looser
 * "computer science" rule can no longer fire on text CSBS already claimed.
 */
function branchesOf(s = '') {
  let rest = ` ${s} `
  const hits = []
  for (const [re, code] of BRANCHES) {
    const g = new RegExp(re.source, 'gi')
    if (g.test(rest)) {
      hits.push(code)
      rest = rest.replace(new RegExp(re.source, 'gi'), ' ')
    }
  }
  return hits
}
/**
 * A single branch, or undefined when the text names several. "B.Tech II-IV year CS/IT/CSBS"
 * belongs to three branches, so tagging it with whichever regex fired first would be a lie.
 */
const branchOf = (s = '') => {
  const hits = branchesOf(s)
  return hits.length === 1 ? hits[0] : undefined
}
/** First match even when several are named — for row labels that are known to be single-branch. */
const firstBranchOf = (s = '') => branchesOf(s)[0]

const ROMAN = { I: 'I', II: 'II', III: 'III', IV: 'IV', '1': 'I', '2': 'II', '3': 'III', '4': 'IV' }
function yearOf(s = '') {
  const m = /\b(I{1,3}V?|IV|[1-4])(?:st|nd|rd|th)?\s*(?:yr|year)\b/i.exec(s)
  if (!m) return undefined
  return ROMAN[m[1].toUpperCase()]
}
function semesterOf(s = '') {
  // Elementor splits some numerals across inline tags, so stripping markup leaves "SEM I I" for
  // SEM II and "SEM I II" for SEM III. Re-join any run of roman letters that follows "SEM".
  const fixed = s.replace(
    /\b(sem(?:ester)?)[\s.\-]*((?:[IVX]+\s+)+[IVX]+\b)/gi,
    (_, word, numeral) => `${word} ${numeral.replace(/\s+/g, '')}`,
  )
  const m = /\bsem(?:ester)?[\s.\-]*(VIII|VII|VI|IV|IX|V|III|II|I|[1-8])\b/i.exec(fixed)
  if (!m) return undefined
  const v = m[1].toUpperCase()
  return { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII' }[v] ?? v
}
function sectionOf(s = '') {
  const m = /\bsection\s*([AB])\b/i.exec(s) || /^\s*([AB])\s*$/.exec(s)
  return m ? m[1].toUpperCase() : undefined
}
function programmeOf(s = '') {
  if (/PTDC|part[\s-]*time/i.test(s)) return 'B.Tech (PTDC)'
  if (/B\.?\s*Des|bachelor of design/i.test(s)) return 'B.Des'
  if (/M\.?\s*Tech/i.test(s)) return 'M.Tech'
  if (/M\.?\s*Sc/i.test(s)) return 'M.Sc'
  if (/MBA/i.test(s)) return 'MBA'
  if (/Ph\.?\s*D/i.test(s)) return 'Ph.D'
  if (/B\.?\s*Tech|B\.?E\.?\b/i.test(s)) return 'B.Tech'
  return undefined
}

/*
  Resolve to an absolute URL and force https. The live site hard-codes many of its own document
  links as http://, which on an https page is mixed content — browsers block or warn on it.
*/
const absolute = (href) =>
  (href.startsWith('http') ? href : new URL(href, WP + '/').toString()).replace(
    /^http:\/\/(ietdavv\.edu\.in)/i,
    'https://$1',
  )

/* -------------------------------------------------------------- page loading */

async function loadPages() {
  const pages = await get(`${API}/pages?per_page=100&_fields=id,slug,title,content,link`, { json: true })
  return Object.fromEntries(pages.map((p) => [p.slug, { ...p, html: p.content.rendered, name: strip(p.title.rendered) }]))
}

/* ------------------------------------------------------------ the document set */

/**
 * Each source table gets a small adapter describing how to read its axes.
 * `header` rows supply the year/section for a column; the left-hand columns supply branch/label.
 */
function buildDocuments(pages, mediaByUrl) {
  const docs = []
  let seq = 0
  const add = (d) => {
    if (!d.url) return
    const url = absolute(d.url)
    if (!isDoc(url)) return
    const meta = mediaByUrl.get(url.split('?')[0])
    const id = `${d.kind}-${++seq}`
    docs.push({
      id,
      title: d.title.replace(/\s+/g, ' ').trim(),
      url,
      kind: d.kind,
      ...(d.programme ? { programme: d.programme } : {}),
      ...(d.branch ? { branch: d.branch } : {}),
      ...(d.branches?.length ? { branches: d.branches } : {}),
      ...(d.year ? { year: d.year } : {}),
      ...(d.semester ? { semester: d.semester } : {}),
      ...(d.section ? { section: d.section } : {}),
      ...(d.note ? { note: d.note } : {}),
      format: (url.split('?')[0].split('.').pop() || 'pdf').toLowerCase(),
      ...(meta?.date ? { updated: meta.date.slice(0, 10) } : {}),
    })
  }

  const label = (parts) => parts.filter(Boolean).join(' · ')

  /* ---- 1. B.Tech I year class timetables ------------------------------- */
  {
    const html = pages['b-tech-i-year-class-time-table']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      const head = g[0]?.map((c) => c?.text ?? '') ?? []
      for (let r = 1; r < g.length; r++) {
        const row = g[r] ?? []
        const rowLabel = row[0]?.text ?? ''
        // A row is only genuinely sectioned when it actually carries files in 2+ section columns.
        const sectionColumns = row.filter((cell, i) => cell?.links?.length && sectionOf(head[i] ?? '')).length
        for (let c = 0; c < row.length; c++) {
          const cell = row[c]
          if (!cell?.links?.length) continue
          const colHead = head[c] ?? ''
          const branch = branchesOf(rowLabel)[0] ?? branchesOf(colHead)[0]
          const section =
            sectionColumns > 1 ? sectionOf(colHead) : sectionOf(row[1]?.text ?? '') ?? sectionOf(cell.text)
          const programme = programmeOf(rowLabel) ?? 'B.Tech'
          // Drop the boilerplate the row label repeats ("B.Tech. I Year … Class Time-table").
          const rowSubject = rowLabel
            .replace(/class\s*time[\s-]*table/gi, '')
            .replace(/^B\.?\s*Tech\.?\s*I\s*Year\s*/i, '')
            .replace(/^bachelor of design$/i, 'Bachelor of Design')
            .trim()
          for (const l of cell.links) {
            if (!isDoc(l.href)) continue
            add({
              kind: 'class-timetable',
              url: l.href,
              programme,
              branch,
              year: 'I',
              section,
              title: label([
                `${programme} I Year`,
                branch ? BRANCH_NAMES[branch] : rowSubject || undefined,
                section && `Section ${section}`,
              ]),
            })
          }
        }
      }
    }
  }

  /* ---- 2. B.Tech II–IV year class timetables ---------------------------- */
  {
    const html = pages['class-time-table']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      const head = g[0]?.map((c) => c?.text ?? '') ?? []
      for (let r = 1; r < g.length; r++) {
        const row = g[r] ?? []
        const rowLabel = row[0]?.text ?? ''
        const subLabel = row[1]?.text ?? ''
        const sectionCol = sectionOf(subLabel)
        // The branch cell rowspans over its variant rows, so the PTDC row reports
        // "Mechanical Engineering" in column 0 and "PTDC" in column 1. Read both, or the
        // part-time timetables come out as exact duplicates of the full-time ones.
        const rowContext = sectionCol ? rowLabel : `${rowLabel} ${subLabel}`.trim()
        for (let c = 0; c < row.length; c++) {
          const cell = row[c]
          if (!cell?.links?.length) continue
          const year = yearOf(head[c] ?? '')
          const branch = branchesOf(rowContext)[0]
          const programme = programmeOf(rowContext) ?? 'B.Tech'
          for (const l of cell.links) {
            if (!isDoc(l.href)) continue
            add({
              kind: 'class-timetable',
              url: l.href,
              programme,
              branch,
              year,
              section: sectionCol,
              title: label([
                `${programme}${year ? ` ${year} Year` : ''}`,
                branch ? BRANCH_NAMES[branch] : rowLabel,
                sectionCol && `Section ${sectionCol}`,
              ]),
            })
          }
        }
      }
    }
  }

  /* ---- 3. M.Tech / M.Sc class timetables -------------------------------- */
  {
    const html = pages['mtech-msc-class-time-table']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      for (let r = 0; r < g.length; r++) {
        const row = g[r] ?? []
        const rowLabel = row[0]?.text ?? ''
        const spec = row[1]?.text ?? ''
        for (const cell of row) {
          if (!cell?.links?.length) continue
          for (const l of cell.links) {
            if (!isDoc(l.href)) continue
            const programme = programmeOf(rowLabel) ?? programmeOf(l.href) ?? 'M.Tech'
            const branch = branchOf(rowLabel)
            const year = yearOf(rowLabel) ?? yearOf(l.href) ?? 'I'
            add({
              kind: 'class-timetable',
              url: l.href,
              programme,
              branch,
              year,
              semester: semesterOf(l.href),
              title: label([
                `${programme} ${year} Year`,
                branch ? BRANCH_NAMES[branch] : undefined,
                spec && !/download|^\s*$/i.test(spec) && !sectionOf(spec) ? spec : undefined,
              ]),
              note: spec && !/download/i.test(spec) ? spec : undefined,
            })
          }
        }
      }
    }
  }

  /* ---- 4. Examination timetables (titles already descriptive) ----------- */
  {
    const html = pages['b-tech-i-be-iiyr-ivyr-beptdc-msc-m-tech']?.html ?? ''
    for (const t of tablesIn(html)) {
      for (const row of tableGrid(t)) {
        const title = row?.[0]?.text ?? ''
        if (!title || /^courses?$/i.test(title)) continue
        for (const cell of row.slice(1)) {
          for (const l of cell?.links ?? []) {
            if (!isDoc(l.href)) continue
            add({
              kind: 'exam-timetable',
              url: l.href,
              title,
              programme: programmeOf(title),
              branch: branchOf(title),
              year: yearOf(title),
              semester: semesterOf(title),
            })
          }
        }
      }
    }
  }

  /* ---- 5. Syllabus (CBCS) ------------------------------------------------ */
  {
    const html = pages['syllabus-cbcs-scheme']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      // Header may occupy two stacked rows (Year band above, SEM labels below).
      const bandRow = g[0]?.map((c) => c?.text ?? '') ?? []
      const semRow = g[1]?.map((c) => c?.text ?? '') ?? []
      for (let r = 0; r < g.length; r++) {
        const row = g[r] ?? []
        const rowLabel = row[0]?.text ?? ''
        for (let c = 0; c < row.length; c++) {
          const cell = row[c]
          if (!cell?.links?.length) continue
          for (const l of cell.links) {
            if (!isDoc(l.href)) continue
            const ctx = `${rowLabel} ${bandRow[c] ?? ''} ${semRow[c] ?? ''} ${cell.text} ${l.text} ${l.href}`
            const branch = branchesOf(rowLabel)[0] ?? branchesOf(l.href)[0]
            const programme = programmeOf(rowLabel) ?? programmeOf(ctx) ?? 'B.Tech'
            // The semester most often lives in the row label ("… II Year SEM III Scheme & Syllabus").
            const semester =
              semesterOf(rowLabel) ??
              semesterOf(cell.text) ??
              semesterOf(l.text) ??
              semesterOf(semRow[c] ?? '') ??
              semesterOf(l.href)
            const year = yearOf(rowLabel) ?? yearOf(bandRow[c] ?? '') ?? yearOf(ctx)
            const subject = rowLabel
              .replace(/scheme\s*&?\s*syllabus/gi, '')
              .replace(/\bSEM(?:ESTER)?[\s.\-]*(?:VIII|VII|VI|IV|V|III|II|I|[1-8])\b/gi, '')
              .replace(/\b(I{1,3}V?|IV)\s*Year\b/gi, '')
              .replace(/\b20\d\d\b/g, '')
              .replace(/^B\.?\s*(Tech|Des(ign)?)\.?\s*/i, '')
              .replace(/\s{2,}/g, ' ')
              .trim()
            add({
              kind: 'syllabus',
              url: l.href,
              programme,
              branch,
              year,
              semester,
              title: label([
                `${programme} Scheme & Syllabus`,
                branch ? BRANCH_NAMES[branch] : subject || undefined,
                year && !semester ? `${year} Year` : undefined,
                semester && `Semester ${semester}`,
              ]),
            })
          }
        }
      }
    }
  }

  /* ---- 6. Roll lists ----------------------------------------------------- */
  {
    const html = pages['roll-list']?.html ?? ''
    for (const t of tablesIn(html)) {
      for (const row of tableGrid(t)) {
        const rowLabel = row?.[0]?.text ?? ''
        if (!rowLabel || /branch/i.test(rowLabel)) continue
        for (const cell of row.slice(1)) {
          for (const l of cell?.links ?? []) {
            if (!isDoc(l.href)) continue
            const branch = branchOf(rowLabel)
            add({
              kind: 'roll-list',
              url: l.href,
              programme: programmeOf(rowLabel) ?? 'B.Tech',
              branch,
              year: yearOf(rowLabel) ?? 'I',
              title: label(['Roll List', branch ? BRANCH_NAMES[branch] : rowLabel]),
            })
          }
        }
      }
    }
  }

  /* ---- 7. Project documents & formats ------------------------------------ */
  {
    const html = pages['project-documents']?.html ?? ''
    for (const t of tablesIn(html)) {
      const idx = html.indexOf(t)
      // The department heading sits immediately above its table; several formats are shared
      // by two departments ("Computer Engineering Department and Information Technology Department").
      const heading = strip(html.slice(Math.max(0, idx - 1400), idx)).slice(-220)
      const depts = branchesOf(heading)
      for (const row of tableGrid(t)) {
        const title = row?.[0]?.text ?? ''
        if (!title) continue
        for (const cell of row.slice(1)) {
          for (const l of cell?.links ?? []) {
            if (!isDoc(l.href)) continue
            add({
              kind: 'project-format',
              url: l.href,
              branch: depts.length === 1 ? depts[0] : undefined,
              branches: depts.length ? depts : undefined,
              year: 'IV',
              title,
              note: depts.length ? depts.map((b) => BRANCH_NAMES[b]).join(' · ') : undefined,
            })
          }
        }
      }
    }
  }

  /* ---- 8. Student feedback reports --------------------------------------- */
  {
    const html = pages['student-feedback']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      const head = strip(g[0]?.map((c) => c?.text).join(' ') ?? '')
      const isAction = /action/i.test(head) || /action/i.test(strip(html.slice(0, html.indexOf(t))).slice(-300))
      for (const row of g) {
        const rowLabel = row?.[0]?.text ?? ''
        if (!rowLabel || /department/i.test(rowLabel)) continue
        for (const cell of row.slice(1)) {
          for (const l of cell?.links ?? []) {
            if (!isDoc(l.href)) continue
            const branch = branchOf(rowLabel)
            add({
              kind: 'feedback-report',
              url: l.href,
              branch,
              title: label([
                /Action_Taken/i.test(l.href) || isAction ? 'Action Taken Report' : 'Student Feedback Report',
                branch ? BRANCH_NAMES[branch] : rowLabel,
              ]),
            })
          }
        }
      }
    }
  }

  /* ---- 9. Admission brochures & FAQs ------------------------------------- */
  {
    const html = pages['admission']?.html ?? ''
    for (const t of tablesIn(html)) {
      const g = tableGrid(t)
      const head = g[0]?.map((c) => c?.text ?? '') ?? []
      for (let r = 1; r < g.length; r++) {
        const row = g[r] ?? []
        const rowLabel = row[0]?.text ?? ''
        for (let c = 1; c < row.length; c++) {
          for (const l of row[c]?.links ?? []) {
            if (!isDoc(l.href)) continue
            add({
              kind: 'admission',
              url: l.href,
              programme: programmeOf(rowLabel),
              title: label([rowLabel.replace(/^admission open in\s*/i, '').trim(), head[c] || 'Information']),
            })
          }
        }
      }
    }
  }

  /* ---- 10. Statutory disclosures & anti-ragging -------------------------- */
  for (const slug of ['mandatory-disclosure-and-eoas', 'anti-ragging-discipline-related']) {
    const html = pages[slug]?.html ?? ''
    for (const t of tablesIn(html)) {
      for (const row of tableGrid(t)) {
        const title = row?.[0]?.text ?? ''
        if (!title) continue
        for (const cell of row.slice(1)) {
          for (const l of cell?.links ?? []) {
            if (!isDoc(l.href)) continue
            add({ kind: 'disclosure', url: l.href, title })
          }
        }
      }
    }
  }

  // De-duplicate on (url, kind) — some tables repeat a file across sections.
  const seen = new Map()
  for (const d of docs) {
    const k = `${d.kind}|${d.url}|${d.section ?? ''}|${d.year ?? ''}|${d.semester ?? ''}`
    if (!seen.has(k)) seen.set(k, d)
  }
  return [...seen.values()]
}

/* ------------------------------------------------------- syllabus availability */

/**
 * The live syllabus page renders a branch × semester matrix of "SEM I … SEM VIII" links, but
 * the overwhelming majority are href="#" — a student clicking "SEM V" gets nothing, with no
 * indication beforehand. We record the matrix WITH its true availability so the new UI can say
 * "not yet published" instead of dangling a dead link, and so the college gets a worklist.
 */
function buildSyllabusMatrix(pages) {
  const html = pages['syllabus-cbcs-scheme']?.html ?? ''
  const entries = []

  // Locate every "Schemes & Syllabus for <award> program" heading and its offset, so each table
  // can inherit the award from the nearest heading ABOVE it. Reading a fixed window of preceding
  // text instead is unsafe: the word "Scheme" itself contains the letters of an "M.E." match.
  const sections = [...html.matchAll(/Schemes?\s*&(?:amp;)?\s*Syllabus\s+for\s+([^<]{0,70})/gi)].map((m) => ({
    at: m.index ?? 0,
    label: strip(m[1]),
  }))
  const awardFor = (label) =>
    /PTDC/i.test(label)
      ? 'B.Tech (PTDC)'
      : /\bM\.?\s?E\.?\b|\bM\.?\s?Tech\b/i.test(label)
        ? 'M.Tech'
        : /\bM\.?\s?Sc\b/i.test(label)
          ? 'M.Sc'
          : /\bB\.?\s?Tech\b|\bB\.?\s?E\.?\b|4ydc/i.test(label)
            ? 'B.Tech'
            : undefined

  for (const t of tablesIn(html)) {
    const at = html.indexOf(t)
    const section = [...sections].reverse().find((s) => s.at < at)
    const tableProgramme = section ? awardFor(section.label) : undefined
    if (!tableProgramme) continue

    const g = tableGrid(t)
    // Column bands: "Full-Time" / "Part-Time" on the header row of the M.Tech matrix.
    const band = g[0]?.map((c) => c?.text ?? '') ?? []
    for (const row of g) {
      const rowLabel = row?.[0]?.text ?? ''
      if (!rowLabel || /^(department|branch|s\.?no)/i.test(rowLabel)) continue
      const branch = branchesOf(rowLabel)[0]
      if (!branch) continue
      // "Computer Engineering specialization in Software Engineering" -> keep the specialisation.
      const spec = /specializ|specialis/i.test(rowLabel)
        ? rowLabel.replace(/^.*?specializ(?:ation)?\s*(?:in|with)?\s*/i, '').trim()
        : undefined
      for (let c = 1; c < row.length; c++) {
        for (const raw of row[c]?.allLinks ?? []) {
          const sem = semesterOf(raw.text)
          if (!sem) continue
          const live = Boolean(raw.href) && raw.href !== '#' && !/^javascript:/i.test(raw.href) && isDoc(raw.href)
          const mode = /part[\s-]*time/i.test(band[c] ?? '')
            ? 'Part-Time'
            : /full[\s-]*time/i.test(band[c] ?? '')
              ? 'Full-Time'
              : undefined
          entries.push({
            programme: tableProgramme,
            branch,
            branchName: BRANCH_NAMES[branch],
            spec,
            mode,
            semester: sem,
            status: live ? 'published' : 'pending',
            ...(live ? { url: absolute(raw.href) } : {}),
          })
        }
      }
    }
  }

  const ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
  const map = new Map()
  for (const e of entries) {
    const k = `${e.programme}|${e.branch}|${e.mode ?? ''}`
    if (!map.has(k))
      map.set(k, {
        programme: e.programme,
        branch: e.branch,
        branchName: e.branchName,
        ...(e.spec ? { specialisation: e.spec } : {}),
        ...(e.mode ? { mode: e.mode } : {}),
        semesters: {},
      })
    const row = map.get(k)
    if (!row.semesters[e.semester] || e.status === 'published')
      row.semesters[e.semester] = { status: e.status, ...(e.url ? { url: e.url } : {}) }
  }
  return [...map.values()].map((r) => ({
    ...r,
    semesterList: ORDER.filter((s) => r.semesters[s]).map((s) => ({ semester: s, ...r.semesters[s] })),
  }))
}

/* ------------------------------------------------------------------- notices */

async function buildNotices() {
  const html = await get(`${WP}/notices/`)
  const out = []
  const re =
    /grid-item([^"]*)"[\s\S]{0,400}?notice-date">\s*(\d+)\s*<span>(\w+)<\/span>[\s\S]{0,400}?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  for (const m of html.matchAll(re)) {
    const cats = m[1].split(/\s+/).filter((c) => c.startsWith('filter_')).map((c) => c.replace('filter_', ''))
    const title = strip(m[5])
    if (!title || out.some((n) => n.title === title)) continue
    out.push({
      id: `notice-${out.length + 1}`,
      title,
      day: m[2],
      month: m[3],
      url: absolute(m[4]),
      categories: cats.length ? cats : ['latest'],
    })
  }
  return out
}

/* -------------------------------------------------------------------- images */

const IMAGES = {
  brand: [
    ['2023/10/iet_logo.png', 'iet-crest.png'],
    ['2024/09/DAVV-Final-Logo-May-2026-2.png', 'davv-crest.png'],
  ],
  campus: [
    ['2026/05/PV03_S_54_2.jpg', 'academic-block.jpg'],
    ['2026/05/PV03_S_7_1.jpg', 'computer-engineering-dept.jpg'],
    ['2026/05/PV03_S_36_2-scaled.jpg', 'campus-03.jpg'],
    ['2026/05/PV03_S_31_2-scaled.jpg', 'campus-04.jpg'],
    ['2026/05/PV03_S_40_1-scaled.jpg', 'campus-05.jpg'],
    ['2026/05/PV03_S_69_2-scaled.jpg', 'campus-06.jpg'],
    ['2026/05/PV03_S_63_2.jpg', 'campus-07.jpg'],
    ['2026/05/PV03_S_67_2.jpg', 'campus-08.jpg'],
    ['2026/05/PV02_S_8-1-scaled.jpg', 'campus-09.jpg'],
    ['2026/05/PV02_S_65-1-scaled.jpg', 'campus-10.jpg'],
    ['2026/05/PV02_S_86-1.jpg', 'campus-11.jpg'],
    ['2026/05/PV03_S_28_1.jpg', 'campus-12.jpg'],
  ],
  events: [
    ['2026/05/PV03_S_66_1.jpg', 'chess-tournament.jpg'],
    ['2026/05/PV03_S_66_2.jpg', 'campus-life-01.jpg'],
    ['2026/05/ISHRAE1.jpg', 'ishrae-01.jpg'],
    ['2026/05/ISHRAE2.jpg', 'ishrae-02.jpg'],
    ['2024/08/P5-scaled.jpg', 'placement-barclays.jpg'],
    ['2024/08/P11-scaled.jpg', 'placement-02.jpg'],
    ['2024/08/P9-scaled.jpg', 'placement-03.jpg'],
    ['2024/08/P13-scaled.jpg', 'placement-04.jpg'],
  ],
  people: [
    ['2026/05/Pratosh-Bansal.webp', 'pratosh-bansal.webp'],
    ['2026/05/Paresh_Atri.jpg', 'paresh-atri.jpg'],
  ],
  docs: [
    ['2026/05/Academic_Calendar_Revised_2025-26.jpg', 'academic-calendar-2025-26.jpg'],
    ['2026/05/AICTE_Academic_Calendar_2025-scaled.jpg', 'aicte-calendar-2025.jpg'],
    ['2026/05/Program_Outcomes.jpg', 'programme-outcomes.jpg'],
    ['2026/05/VM_IET-scaled.jpg', 'vision-mission-iet.jpg'],
    ['2026/05/VM_DAVV-scaled.jpg', 'vision-mission-davv.jpg'],
    ['2026/05/ARC_2025.jpg', 'anti-ragging-committee-2025.jpg'],
    ['2026/05/AR_Squad-2025.jpg', 'anti-ragging-squad-2025.jpg'],
    ['2026/05/AR_CC_2025.jpg', 'counselling-committee-2025.jpg'],
    ['2026/05/AR_DC_025.jpg', 'discipline-committee-2025.jpg'],
  ],
}

async function mirrorImages() {
  let ok = 0
  let failed = 0
  for (const [group, list] of Object.entries(IMAGES)) {
    const dir = path.join(ROOT, 'public/media', group)
    await mkdir(dir, { recursive: true })
    for (const [src, name] of list) {
      try {
        const buf = await get(`${WP}/wp-content/uploads/${src}`, { binary: true })
        await writeFile(path.join(dir, name), buf)
        ok++
      } catch (e) {
        failed++
        console.warn(`     ! ${src}: ${e.message}`)
      }
    }
  }
  return { ok, failed }
}

/* ---------------------------------------------------------------------- main */

async function main() {
  console.log('\nIET-DAVV content ingest\n' + '='.repeat(60))

  log('fetching pages…')
  const pages = await loadPages()
  log(`${Object.keys(pages).length} pages`)

  log('fetching media index…')
  const media = []
  for (let p = 1; p <= 6; p++) {
    try {
      const batch = await get(`${API}/media?per_page=100&page=${p}&_fields=id,source_url,date,mime_type`, { json: true })
      if (!Array.isArray(batch) || !batch.length) break
      media.push(...batch)
    } catch {
      break
    }
  }
  const mediaByUrl = new Map(media.map((m) => [m.source_url, m]))
  log(`${media.length} media records`)

  log('parsing document tables…')
  const documents = buildDocuments(pages, mediaByUrl)
  const byKind = documents.reduce((a, d) => ((a[d.kind] = (a[d.kind] ?? 0) + 1), a), {})
  log(`${documents.length} documents:`, JSON.stringify(byKind))

  log('parsing syllabus matrix…')
  const syllabusMatrix = buildSyllabusMatrix(pages)
  const cells = syllabusMatrix.flatMap((r) => Object.values(r.semesters))
  const published = cells.filter((c) => c.status === 'published').length
  log(`${syllabusMatrix.length} branch rows, ${cells.length} semester cells — ${published} published, ${cells.length - published} pending`)

  log('parsing notices…')
  const notices = await buildNotices()
  log(`${notices.length} notices`)

  log('mirroring images…')
  const img = await mirrorImages()
  log(`${img.ok} images copied${img.failed ? `, ${img.failed} failed` : ''}`)

  const out = path.join(ROOT, 'content')
  await mkdir(out, { recursive: true })
  const write = async (name, data) => {
    await writeFile(path.join(out, name), JSON.stringify(data, null, 2) + '\n')
    log(`wrote content/${name}`)
  }

  await write('documents.json', documents)
  await write('syllabus-matrix.json', syllabusMatrix)
  await write('notices.json', notices)

  // Prose we lift verbatim from the live site, kept beside the generated data.
  await write(
    'source-prose.json',
    Object.fromEntries(
      ['about-us', 'about-davv', 'scholarships', 'contact', 'admission', 'spoken-tutorial', 'ishare', 'e-books', 'result']
        .filter((s) => pages[s])
        .map((s) => [s, { title: pages[s].name, lines: richText(pages[s].html) }]),
    ),
  )

  console.log('='.repeat(60))
  console.log('done\n')
}

main().catch((e) => {
  console.error('\ningest failed:', e)
  process.exit(1)
})
