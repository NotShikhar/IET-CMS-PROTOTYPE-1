import type { Metadata } from 'next'
import './globals.css'
import { site } from '@/lib/content'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.parent}`,
    template: `%s · IET DAVV`,
  },
  description:
    'The Institute of Engineering & Technology, Devi Ahilya Vishwavidyalaya, Indore — an autonomous, AICTE-approved institute offering 27 programmes across engineering, design, management and science.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
