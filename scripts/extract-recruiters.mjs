#!/usr/bin/env node
/**
 * Pulls the recruiter logos out of the college's own Placement_IET.pdf.
 *
 * The PDF stores each logo as a Flate-wrapped JPEG XObject, and the slides they were lifted
 * from mix white and black backgrounds. Both are normalised here to a single treatment —
 * trimmed, background knocked out to transparency, logo flattened to one ink — so the wall
 * reads as one designed row rather than a ransom note of mismatched chips.
 *
 *   node scripts/extract-recruiters.mjs
 *
 * Requires Python 3 with Pillow (already present on this machine); the heavy pixel work is
 * done there because Node has no image decoder in the standard library.
 */

import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PDF = path.join(ROOT, 'scripts/.cache/docs/Placement_IET.pdf')
const OUT = path.join(ROOT, 'public/media/recruiters')

/**
 * Index into the PDF's image list -> the company it depicts, read off a contact sheet.
 * Duplicates and non-recruiter artwork (campus photos, student portraits, the NIRF mark)
 * are simply absent.
 */
const LOGOS = [
  [23, 'walmart', 'Walmart'],
  [24, 'google', 'Google'],
  [25, 'amazon', 'Amazon'],
  [26, 'microsoft', 'Microsoft'],
  [42, 'beghou', 'Beghou Consulting'],
  [43, 'deutsche-bank', 'Deutsche Bank'],
  [44, 'cognizant', 'Cognizant'],
  [46, 'avalara', 'Avalara'],
  [47, 'adani', 'Adani'],
  [48, 'asian-paints', 'Asian Paints'],
  [49, 'capillary', 'Capillary Technologies'],
  [50, 'appalto', 'Appalto'],
  [51, 'barclays', 'Barclays'],
  [53, 'capgemini', 'Capgemini'],
  [55, 'carwale', 'CarWale'],
  [56, 'cloudsek', 'CloudSEK'],
  [57, 'consultadd', 'ConsultAdd'],
  [58, 'coreel', 'CoreEL Technologies'],
  [59, 'credit-suisse', 'Credit Suisse'],
  [60, 'arcesium', 'Arcesium'],
  [61, 'cubexo', 'CubexO'],
  [63, 'deqode', 'Deqode'],
  [64, 'dhl', 'DHL'],
  [65, 'dice', 'Dice'],
  [66, 'digivalet', 'DigiValet'],
  [67, 'flipr', 'FLiPR'],
  [69, 'force-motors', 'Force Motors'],
  [70, 'forma-ai', 'Forma.ai'],
  [71, 'gammaedge', 'GammaEdge'],
  [72, 'growisto', 'Growisto'],
  [73, 'eclerx', 'eClerx'],
  [74, 'groww', 'Groww'],
  [75, 'intellicus', 'Intellicus'],
  [76, 'idfc-first-bank', 'IDFC FIRST Bank'],
  [77, 'impetus', 'Impetus'],
  [78, 'infosys', 'Infosys'],
  [79, 'jk-cement', 'JK Cement'],
  [81, 'lg', 'LG'],
  [82, 'ltimindtree', 'LTIMindtree'],
  [83, 'lt-technology-services', 'L&T Technology Services'],
  [84, 'lumber', 'Lumber'],
  [85, 'mastercard', 'Mastercard'],
  [86, 'medibuddy', 'MediBuddy'],
  [88, 'mu-sigma', 'Mu Sigma'],
  [89, 'netlink', 'Netlink'],
  [90, 'nri', 'NRI'],
  [91, 'nuclei', 'Nuclei'],
  [92, 'nucleusteq', 'NucleusTeq'],
  [93, 'ocean-friends', 'Ocean Friends'],
  [94, 'pharmeasy', 'PharmEasy'],
  [95, 'planful', 'Planful'],
  [96, 'platform9', 'Platform9'],
  [97, 'promobi', 'ProMobi'],
  [98, 'ptc', 'PTC'],
  [100, 'quantiphi', 'Quantiphi'],
  [101, 'questkart', 'Questkart'],
  [102, 'kriti-industries', 'Kriti Industries'],
  [104, 'kirloskar', 'Kirloskar'],
  [105, 'schneider-electric', 'Schneider Electric'],
  [106, 'unthinkable', 'Unthinkable Solutions'],
  [107, 'tejas-networks', 'Tejas Networks'],
  [108, 'trueigtech', 'TrueIGTech'],
  [110, 'unicharm', 'Unicharm'],
  [111, 'yuvasoft', 'YuvaSoft'],
  [112, 'volvo', 'Volvo'],
  [113, 'truechip', 'Truechip'],
  [114, 'rakuten-symphony', 'Rakuten Symphony'],
  [115, 'shakti-pumps', 'Shakti Pumps'],
  [116, 'tata-technologies', 'Tata Technologies'],
  [117, 'ubs', 'UBS'],
  [118, 'zensar', 'Zensar'],
  [119, 'zs', 'ZS Associates'],
]

const PY = `
import re, zlib, io, sys, json
from PIL import Image, ImageOps

pdf = sys.argv[1]
outdir = sys.argv[2]
wanted = json.loads(sys.argv[3])   # {index: slug}

data = open(pdf, 'rb').read()
images = []
for m in re.finditer(rb'<<([^<>]|<<[^>]*>>)*?>>\\s*stream\\r?\\n', data, re.S):
    header = m.group(0)
    if b'/Image' not in header: continue
    start = m.end(); end = data.find(b'endstream', start)
    if end == -1: continue
    payload = data[start:end].rstrip(b'\\r\\n')
    try: payload = zlib.decompress(payload)
    except Exception: pass
    if payload[:3] != b'\\xff\\xd8\\xff' and payload[:8] != b'\\x89PNG\\r\\n\\x1a\\n':
        continue
    w = re.search(rb'/Width\\s+(\\d+)', header); h = re.search(rb'/Height\\s+(\\d+)', header)
    images.append((int(w.group(1)) if w else 0, int(h.group(1)) if h else 0, payload))

# Same ordering the contact sheet used: filename order, then the small ones only.
images.sort(key=lambda t: (0,))          # keep discovery order
small = [im for im in images if im[0]*im[1] < 400000]

def trim(im, bg):
    # Drop a uniform border of the background colour.
    px = im.convert('RGB')
    w, h = px.size
    def row_uniform(y):
        return all(abs(sum(px.getpixel((x, y)))/3 - bg) < 26 for x in range(0, w, max(1, w//40)))
    def col_uniform(x):
        return all(abs(sum(px.getpixel((x, y)))/3 - bg) < 26 for y in range(0, h, max(1, h//40)))
    top = 0
    while top < h-1 and row_uniform(top): top += 1
    bot = h-1
    while bot > top and row_uniform(bot): bot -= 1
    left = 0
    while left < w-1 and col_uniform(left): left += 1
    right = w-1
    while right > left and col_uniform(right): right -= 1
    pad = 2
    return im.crop((max(0,left-pad), max(0,top-pad), min(w,right+1+pad), min(h,bot+1+pad)))

written = {}
for idx_s, slug in wanted.items():
    idx = int(idx_s)
    if idx >= len(small): continue
    w, h, payload = small[idx]
    im = Image.open(io.BytesIO(payload)).convert('RGB')
    # Background luminance, sampled from the four corners.
    W, H = im.size
    corners = [im.getpixel(p) for p in ((0,0),(W-1,0),(0,H-1),(W-1,H-1))]
    bg = sum(sum(c)/3 for c in corners)/4
    im = trim(im, bg)
    # A dark slide background becomes light, so every logo ends up dark-on-light.
    if bg < 128:
        im = Image.eval(im, lambda v: 255 - v)
    # Flatten to a single ink: inverting a colour logo distorts its hue, and a mixed
    # colour/greyscale wall looks accidental. One ink is a deliberate, uniform treatment.
    g = im.convert('L')
    # Stretch the histogram before keying out the background. Pale brand colours (Credit
    # Suisse, UBS, eClerx) turn into near-white grey once desaturated and would otherwise
    # fade off the page; this also drives the background to true white so no grey plate
    # survives behind logos that sat on an off-white slide.
    g = ImageOps.autocontrast(g, cutoff=(1, 4))
    # Knock the (now white) background out to transparency.
    out = Image.new('RGBA', g.size)
    gp = g.load(); op = out.load()
    for y in range(g.size[1]):
        for x in range(g.size[0]):
            v = gp[x, y]
            alpha = 0 if v > 228 else min(255, int((228 - v) * 1.9))
            op[x, y] = (26, 42, 34, alpha)
    # Normalise to a common height so the row reads evenly.
    TARGET_H = 96
    ratio = TARGET_H / out.size[1]
    out = out.resize((max(1, int(out.size[0]*ratio)), TARGET_H), Image.LANCZOS)
    if out.size[0] > 380:
        r = 380 / out.size[0]
        out = out.resize((380, max(1, int(out.size[1]*r))), Image.LANCZOS)
    out.save(f'{outdir}/{slug}.png')
    written[slug] = out.size
print(json.dumps(written))
`

if (!existsSync(PDF)) {
  console.error(`\nMissing ${path.relative(ROOT, PDF)}.`)
  console.error('Fetch it first:\n  curl -s https://ietdavv.edu.in/ietnew/wp-content/uploads/2026/05/Placement_IET.pdf \\\n    -o scripts/.cache/docs/Placement_IET.pdf\n')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
const wanted = Object.fromEntries(LOGOS.map(([i, slug]) => [String(i), slug]))
const raw = execFileSync('python3', ['-c', PY, PDF, OUT, JSON.stringify(wanted)], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
const written = JSON.parse(raw.trim().split('\n').pop())

const recruiters = LOGOS.filter(([, slug]) => written[slug]).map(([, slug, name]) => ({
  name,
  slug,
  logo: `/media/recruiters/${slug}.png`,
}))

writeFileSync(path.join(ROOT, 'content/recruiters.json'), JSON.stringify(recruiters, null, 2) + '\n')
console.log(`\n  ${recruiters.length} recruiter logos -> public/media/recruiters/`)
console.log(`  wrote content/recruiters.json\n`)
