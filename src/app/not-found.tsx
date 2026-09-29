import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-[60svh] flex-col justify-center py-16">
      <p className="text-xs font-medium tracking-[0.14em] text-ink-3 uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">Nothing here.</h1>
      <p className="mt-4 text-lg text-ink-2">That page does not exist, or it moved.</p>
      <Link href="/" className="mt-8 font-medium text-accent underline underline-offset-4">
        Back to the home page
      </Link>
    </section>
  )
}
