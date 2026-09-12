'use client'

import Image from 'next/image'
import { recruiters } from '@/lib/content'

/**
 * A continuous logo rail. The track holds two identical copies of the list and translates by
 * exactly -50%, so the moment the first copy scrolls out the second is pixel-aligned behind it
 * and the loop is seamless. Row B runs the opposite way to keep the band from reading as a
 * single sliding sheet.
 *
 * It pauses on hover and, via prefers-reduced-motion, doesn't animate at all for readers who
 * have asked for stillness — the rail then simply scrolls by hand.
 */
export default function RecruiterMarquee() {
  const half = Math.ceil(recruiters.length / 2)
  const rowA = recruiters.slice(0, half)
  const rowB = recruiters.slice(half)

  return (
    <div className="marquee-wrap">
      <MarqueeRow items={rowA} duration={62} />
      <MarqueeRow items={rowB} duration={74} reverse />
    </div>
  )
}

function MarqueeRow({
  items,
  duration,
  reverse = false,
}: {
  items: { name: string; slug: string; logo: string }[]
  duration: number
  reverse?: boolean
}) {
  return (
    <div className="marquee" role="list" aria-label="Recruiting companies">
      <div
        className={`marquee-track ${reverse ? 'marquee-track--reverse' : ''}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
            {items.map((r) => (
              <div key={`${copy}-${r.slug}`} className="marquee-item" role={copy === 0 ? 'listitem' : undefined}>
                <Image
                  src={r.logo}
                  alt={copy === 0 ? r.name : ''}
                  title={r.name}
                  width={190}
                  height={48}
                  className="marquee-logo"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
