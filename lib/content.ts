import documentsJson from '@/content/documents.json'
import noticesJson from '@/content/notices.json'
import syllabusJson from '@/content/syllabus-matrix.json'
import siteJson from '@/content/site.json'
import statsJson from '@/content/stats.json'
import programmesJson from '@/content/programmes.json'
import departmentsJson from '@/content/departments.json'
import peopleJson from '@/content/people.json'
import aboutJson from '@/content/pages/about.json'
import admissionsJson from '@/content/pages/admissions.json'
import contactJson from '@/content/pages/contact.json'
import campusJson from '@/content/pages/campus.json'

/* ------------------------------------------------------------------- types */

export type DocKind =
  | 'class-timetable'
  | 'exam-timetable'
  | 'syllabus'
  | 'roll-list'
  | 'project-format'
  | 'feedback-report'
  | 'admission'
  | 'disclosure'

export type BranchCode = 'CSE' | 'IT' | 'ETC' | 'EI' | 'ME' | 'CE' | 'CSBS' | 'IP' | 'EEE' | 'Applied Science'

export interface Doc {
  id: string
  title: string
  url: string
  kind: DocKind
  programme?: string
  branch?: BranchCode
  branches?: BranchCode[]
  year?: 'I' | 'II' | 'III' | 'IV'
  semester?: string
  section?: 'A' | 'B'
  note?: string
  format: string
  updated?: string
}

export interface Notice {
  id: string
  title: string
  day: string
  month: string
  url: string
  categories: string[]
}

export interface SyllabusRow {
  programme: string
  branch: string
  branchName: string
  specialisation?: string
  mode?: string
  semesterList: { semester: string; status: 'published' | 'pending'; url?: string }[]
}

/* -------------------------------------------------------------- accessors */

export const site = siteJson
export const stats = statsJson
export const programmes = programmesJson
export const departments = departmentsJson
export const people = peopleJson
export const about = aboutJson
export const admissions = admissionsJson
export const contact = contactJson
export const campus = campusJson

export const documents = documentsJson as Doc[]
export const notices = noticesJson as Notice[]
export const syllabusMatrix = syllabusJson as SyllabusRow[]

/* --------------------------------------------------------------- metadata */

export const KIND_LABELS: Record<DocKind, string> = {
  'class-timetable': 'Class timetables',
  'exam-timetable': 'Examination timetables',
  syllabus: 'Schemes & syllabi',
  'roll-list': 'Roll lists',
  'project-format': 'Project formats',
  'feedback-report': 'Feedback reports',
  admission: 'Admission information',
  disclosure: 'Statutory disclosures',
}

export const KIND_BLURBS: Record<DocKind, string> = {
  'class-timetable': 'Weekly teaching timetables by branch, year and section.',
  'exam-timetable': 'Theory and practical examination schedules, including revisions.',
  syllabus: 'Scheme and syllabus documents under the CBCS scheme.',
  'roll-list': 'Enrolment roll lists published at the start of the session.',
  'project-format': 'Thesis, synopsis, SRS/SDS and report formats for final-year projects.',
  'feedback-report': 'Departmental student feedback and the action taken in response.',
  admission: 'Programme brochures, general information and frequently asked questions.',
  disclosure: 'AICTE mandatory disclosure, EOAs and anti-ragging regulations.',
}

export const BRANCH_NAMES: Record<string, string> = {
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

export const YEAR_ORDER = ['I', 'II', 'III', 'IV'] as const
export const SEM_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const

/* --------------------------------------------------------------- helpers */

export interface DocFilters {
  q?: string
  kind?: string
  programme?: string
  branch?: string
  year?: string
  section?: string
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD')

// Students type "3rd year" and "mech", not "III" and "Mechanical Engineering". Each facet value
// is expanded into the words people actually use, so the search meets them where they are.
const ROMAN_ALIASES: Record<string, string> = {
  I: '1 1st first i',
  II: '2 2nd second ii',
  III: '3 3rd third iii',
  IV: '4 4th fourth iv',
  V: '5 5th fifth v',
  VI: '6 6th sixth vi',
  VII: '7 7th seventh vii',
  VIII: '8 8th eighth viii',
}

const BRANCH_ALIASES: Record<string, string> = {
  CSE: 'cs cse computer engineering computer science',
  IT: 'it information technology',
  ETC: 'etc e&tc ec electronics telecommunication telecom',
  EI: 'ei e&i electronics instrumentation',
  ME: 'me mech mechanical',
  CE: 'ce civil',
  CSBS: 'csbs computer science business systems',
  IP: 'ip industrial production',
  EEE: 'eee electrical electronics',
  'Applied Science': 'applied science physics chemistry mathematics maths',
}

const PROGRAMME_ALIASES: Record<string, string> = {
  'B.Tech': 'btech b.tech be b.e bachelor technology ug undergraduate',
  'B.Tech (PTDC)': 'ptdc part time btech be diploma',
  'B.Des': 'bdes b.des design bachelor of design',
  'M.Tech': 'mtech m.tech me m.e postgraduate pg masters',
  'M.Sc': 'msc m.sc master science',
  MBA: 'mba management',
  'Ph.D': 'phd ph.d doctoral doctorate research',
}

const haystackFor = (doc: Doc) =>
  norm(
    [
      doc.title,
      doc.note ?? '',
      doc.programme ?? '',
      doc.programme ? PROGRAMME_ALIASES[doc.programme] ?? '' : '',
      ...[...(doc.branch ? [doc.branch] : []), ...(doc.branches ?? [])].map(
        (b) => `${b} ${BRANCH_NAMES[b] ?? ''} ${BRANCH_ALIASES[b] ?? ''}`,
      ),
      doc.year ? `year ${doc.year} ${ROMAN_ALIASES[doc.year] ?? ''}` : '',
      doc.semester ? `semester sem ${doc.semester} ${ROMAN_ALIASES[doc.semester] ?? ''}` : '',
      doc.section ? `section ${doc.section}` : '',
      KIND_LABELS[doc.kind],
      decodeURIComponent(doc.url.split('/').pop() ?? '').replace(/[_\-.]+/g, ' '),
    ].join(' '),
  )

const haystackCache = new WeakMap<Doc, string>()

/** Free-text search across the title, every facet (and its aliases), and the filename. */
function matchesQuery(doc: Doc, q: string) {
  if (!q) return true
  let hay = haystackCache.get(doc)
  if (!hay) {
    hay = haystackFor(doc)
    haystackCache.set(doc, hay)
  }
  // Every whitespace-separated term must appear, so "it 3rd" narrows rather than widens.
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay!.includes(term))
}

export function filterDocuments(docs: Doc[], f: DocFilters): Doc[] {
  return docs.filter((d) => {
    if (f.kind && d.kind !== f.kind) return false
    if (f.programme && d.programme !== f.programme) return false
    if (f.branch && d.branch !== f.branch && !(d.branches ?? []).includes(f.branch as BranchCode)) return false
    if (f.year && d.year !== f.year) return false
    if (f.section && d.section !== f.section) return false
    if (f.q && !matchesQuery(d, f.q)) return false
    return true
  })
}

/** Distinct values for a facet, ordered meaningfully, with counts under the current filters. */
export function facetCounts(docs: Doc[], key: 'kind' | 'programme' | 'branch' | 'year' | 'section') {
  const counts = new Map<string, number>()
  for (const d of docs) {
    const values: string[] =
      key === 'branch'
        ? [...(d.branch ? [d.branch] : []), ...(d.branches ?? [])]
        : d[key]
          ? [d[key] as string]
          : []
    for (const v of new Set(values)) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  const order: Record<string, string[]> = {
    kind: Object.keys(KIND_LABELS),
    year: [...YEAR_ORDER],
    section: ['A', 'B'],
    programme: ['B.Tech', 'B.Tech (PTDC)', 'B.Des', 'M.Tech', 'M.Sc', 'MBA', 'Ph.D'],
    branch: Object.keys(BRANCH_NAMES),
  }
  const rank = (v: string) => {
    const i = order[key]?.indexOf(v) ?? -1
    return i === -1 ? 999 : i
  }
  return [...counts.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }))
}

export const documentCount = documents.length

export const syllabusStats = (() => {
  const cells = syllabusMatrix.flatMap((r) => r.semesterList)
  const published = cells.filter((c) => c.status === 'published').length
  return { total: cells.length, published, pending: cells.length - published }
})()
