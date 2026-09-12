import Link from 'next/link'

export default function PageHero({
  eyebrow,
  title,
  standfirst,
  crumb,
}: {
  eyebrow: string
  title: string
  standfirst?: string
  crumb?: string
}) {
  return (
    <section className="border-b border-line bg-paper-2">
      <div className="shell py-14 md:py-20">
        {crumb && (
          <nav aria-label="Breadcrumb" className="mb-6 text-[0.8rem] text-ink-3">
            <Link href="/" className="hover:text-green-700">
              Home
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-ink-2">{crumb}</span>
          </nav>
        )}
        <p className="eyebrow">{eyebrow}</p>
        <div className="rule-gold mt-3.5" />
        <h1 className="mt-5 max-w-3xl text-[2.1rem] leading-[1.12] md:text-[3.1rem]">{title}</h1>
        {standfirst && (
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-2 md:text-[1.1rem]">
            {standfirst}
          </p>
        )}
      </div>
    </section>
  )
}
