# IET DAVV — CMS Prototype

A modern rebuild of the public site for the **Institute of Engineering & Technology, Devi Ahilya
Vishwavidyalaya, Indore**. Every word, document and photograph is taken from the live WordPress
site at `ietdavv.edu.in/ietnew` — nothing is invented.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (all 8 routes prerender static) |
| `npm run ingest` | Re-pull content from the live WordPress REST API into `content/` |
| `npm run check-links` | HEAD every document URL and report failures |
| `node scripts/extract-recruiters.mjs` | Re-extract the recruiter logos from `Placement_IET.pdf` |

---

## What this prototype argues

The site's real job is **document delivery**. 104 files — timetables, examination schedules,
syllabi, roll lists, project formats, feedback reports, statutory disclosures — are the payload
students actually come for. On the current site they are spread across eight wide HTML tables
in which almost every link is labelled with the single word "Download".

So the centrepiece here is `/resources`: one searchable, filterable index over all of them.

- Search understands how students actually type — `civil 3rd`, `mech 2nd year`, `it roll list`,
  `csbs sem 3` all resolve correctly, because each facet is expanded with aliases
  (III ↔ 3 ↔ 3rd ↔ third, ME ↔ mech ↔ Mechanical, and so on).
- Filters are deep-linkable: `/resources?branch=IT&year=III` returns exactly the two IT third-year
  timetables. Departments link straight into their own filtered view.
- Facet counts reflect every *other* active filter, so a chip never reads "0" for something that
  would in fact return results.
- Every document has a real title. The string "Download" appears nowhere as a link label.

---

## Architecture

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · no runtime CMS dependency.

The load-bearing decision: **every page renders from typed JSON in `content/`.** Nothing is
hardcoded in JSX. That is what makes this a CMS prototype rather than a static mockup — pointing
it at a headless CMS, or back at WordPress's own REST API, is a data-layer swap, not a rewrite.

```
scripts/ingest.mjs      live WordPress  ->  content/*.json  +  public/media/
scripts/check-links.mjs verifies every document URL still resolves
content/                site, stats, documents, notices, syllabus-matrix,
                        programmes, departments, people, pages/*
lib/content.ts          types, facet + search helpers
components/             DocumentHub, NoticeBoard, SiteHeader, SiteFooter, PageHero
app/                    8 routes
public/media/           genuine IET imagery only
```

### How the ingest reads meaning out of the tables

The hard part is that the source tables carry their meaning in *geometry*, not in text: the row
label says which branch, the column header says which year, the cell position says which section,
and the link itself just says "Download".

`scripts/ingest.mjs` therefore expands each table into a dense grid honouring `rowspan`/`colspan`,
then reads the facets back off the axes. Two examples of why that matters:

- "Computer Engineering" `rowspan`s over its Section A and Section B rows. Without grid expansion
  the Section B timetable would lose its branch.
- In the same table "Mechanical Engineering" `rowspan`s over the **PTDC** row, so the part-time
  row reports `Mechanical Engineering` in column 0 and `PTDC` in column 1. Reading only column 0
  produced three timetables that were exact duplicates of the full-time ones. The parser now
  reads both cells.

---

## What we found in the source data

Worth raising with the college — these are defects in the live site, not in this rebuild.

| Finding | Detail |
| --- | --- |
| **Theme demo content is live in production** | The header on every page carries "A modern HTML template for education…", `+61485826710` and **"Yarra Park, Melbourne, Australia"**. `/tuition-fee` quotes US dollars and a "Board of Trustees". `/research` is about "Medicine Research" and a "$1.82 Billion sponsored research budget". WooCommerce `/shop`, `/cart`, `/checkout` and two `/my-account` pages are published. |
| **Homepage statistics are placeholders** | "90% Post-Graduation Success Rate", "No. 1 In The Nation For Materials R&D". The real numbers — 900+ students a year, 100+ publications, ₹57 LPA highest package, the ₹100 Cr ANRF-PAIR project — sit unused on inner pages. This rebuild uses the real ones. |
| **The syllabus matrix is entirely non-functional** | 108 semester links are published. 96 are `href="#"`. 10 more all point at the *same* unrelated page. 2 point at empty stubs. **Zero deliver a syllabus.** `/resources` shows this matrix honestly — "Awaited" instead of a dead link — which doubles as a worklist for the departments. |
| **Every document link is `http://`** | All 104, on an `https://` page — mixed content, which browsers block or warn on. The ingest normalises them to `https://`. |
| **Two different "highest package" figures** | The About page says **₹57 LPA**; the placement document's own chart says **₹50 LPA** for 2024-25. Both are the college's numbers. The site currently shows ₹50 LPA, sourced from the placement document — worth confirming which is correct. |
| **Duplicated pages** | `/notices` and `/exam-notices` render byte-identical content; `/class-time-table` and `/test` duplicate each other. Here there is one notice feed with Latest / Examination / Tender views. |

All 104 documents were verified reachable: `npm run check-links` → **103/103 distinct URLs OK,
0 failures, 59 MB**.

---

## Navigation

The menu tree mirrors the existing site exactly — same labels, same order, same nesting — because
the department already knows where things live:

```
Home · About Us · Academics + · Admission · Activities + · Administration + · Examination + · Tender · Contact
```

`Academics` carries `Programs +`, `Calendar +` and `Schedules +` as third-level fly-outs, and
`Examination` carries `Exam Time Table +`. Desktop opens on hover with a short close delay so a
diagonal mouse path doesn't drop the submenu; mobile renders the same tree as nested accordions.

Old labels now point at the new structure — `Schedules › Class` resolves to
`/resources?kind=class-timetable`, `Roll List` to `/resources?kind=roll-list`, and so on — so the
familiar route reaches the searchable hub instead of a wide table.

Note: submenu markup is created when a menu opens, so nested links are not in the server HTML.
Fine for a prototype; if crawlable submenu links matter, render them always and hide with CSS.

## Placements

`scripts/extract-recruiters.mjs` lifts the recruiter logos straight out of the college's own
`Placement_IET.pdf` — 72 of them, stored in the PDF as Flate-wrapped JPEGs. The slides they came
from mix white and black backgrounds, so each logo is trimmed, inverted if it sat on black,
histogram-stretched (pale marks like Credit Suisse and UBS otherwise fade to nothing once
desaturated), keyed to transparency and flattened to a single ink. The result is one uniform wall
rather than a patchwork of mismatched chips. Swap in official full-colour artwork whenever the
college supplies it — only the PNGs need replacing.

The rail itself holds two identical copies of the list and translates by exactly -50%, so the loop
is seamless; the second row runs in reverse. It pauses on hover and doesn't animate at all under
`prefers-reduced-motion`.

Figures come from the same document: 43 → 46 → 50 companies on campus across 2023-24, 2024-25 and
2025-26, with average CTC 6.3 → 6.5 → 6.7 LPA.

## Design

The palette is taken from the DAVV crest itself — the green ring, the saffron flame, the gold
wheat laurels, the white field — so the site reads as unmistakably IET-DAVV rather than a generic
university template.

```
--green-700  #14614A   primary        --saffron  #EE8A1F   accent
--green-900  #0E4634   headings       --gold     #C9A227   rules
--paper      #FFFFFF   ground         --ink      #17241F   text
--paper-2    #F4F7F4   bands
```

Deliberately light: the ground is near-white and the deep greens are reserved for type, rules and
small chips rather than large filled panels, so green reads as the institute's colour and not as
the page's weight. The hero, the campus-life band and the footer are all light; the only saturated
green left is the thin identity strip at the very top.

Serif display headings over a clean sans body. Light and dark themes are both defined; the page
follows the reader's system setting.

**One CSS note worth knowing before editing `app/globals.css`:** base element styles live inside
`@layer base` and component classes inside `@layer components`. Unlayered element rules beat
*every* layered declaration regardless of specificity, so an unlayered `h1 { color: … }` silently
overrides any Tailwind text-colour utility. Keep new base styles inside the layer.

Also note Tailwind v4 cannot type `text-[var(--x)]` — colour and font-size are ambiguous for the
`text-` prefix, so such classes are silently dropped. Use the registered theme utilities
(`text-ink`, `bg-green-900`, `border-line`), which also support `/opacity` modifiers.

---

## Status

Prototype for review. Not yet carried over: the full faculty directory and HoD list, department
detail pages, placements, alumni, and the activity pages (NSS, GDSC, newsletter). The content
layer is shaped to take them without restructuring.

Open question for the college: should the site keep linking documents at their existing
`ietdavv.edu.in/ietnew/wp-content/uploads/…` URLs — which preserves the current upload workflow —
or mirror them into the new application? This prototype links to the live URLs.
