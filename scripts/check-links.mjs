#!/usr/bin/env node
/**
 * HEAD every document URL and report failures. Confirms the ingest didn't invent or mangle a
 * path, and tells us which of the college's own files have gone missing upstream.
 *
 *   npm run check-links
 */
import { readFile } from 'node:fs/promises'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
const CONCURRENCY = 8

const docs = JSON.parse(await readFile(new URL('../content/documents.json', import.meta.url), 'utf8'))
const urls = [...new Set(docs.map((d) => d.url))]

console.log(`\nChecking ${urls.length} distinct document URLs (${docs.length} entries)…\n`)

const results = []
let cursor = 0
async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++]
    try {
      let res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, redirect: 'follow' })
      // Some hosts refuse HEAD on static files; fall back to a ranged GET.
      if (res.status === 405 || res.status === 501)
        res = await fetch(url, { headers: { 'User-Agent': UA, Range: 'bytes=0-0' } })
      results.push({ url, status: res.status, size: Number(res.headers.get('content-length') ?? 0) })
    } catch (e) {
      results.push({ url, status: 0, error: e.message })
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const ok = results.filter((r) => r.status >= 200 && r.status < 400)
const bad = results.filter((r) => !(r.status >= 200 && r.status < 400))
const bytes = ok.reduce((a, r) => a + r.size, 0)

console.log(`  reachable : ${ok.length}`)
console.log(`  failed    : ${bad.length}`)
console.log(`  total size: ${(bytes / 1024 / 1024).toFixed(1)} MB`)
if (bad.length) {
  console.log('\n  Failures:')
  for (const b of bad) console.log(`    ${String(b.status).padEnd(4)} ${b.url}${b.error ? ` (${b.error})` : ''}`)
}
console.log('')
process.exit(bad.length ? 1 : 0)
