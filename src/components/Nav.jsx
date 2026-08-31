export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-white/[0.08]">
      <div className="tc-page flex items-center justify-between gap-6 h-[60px]">
        <a href="#" className="flex items-center gap-3 no-underline">
          <div className="w-7 h-7 bg-chalk flex items-center justify-center shrink-0">
            <span className="font-body text-sm font-medium text-ink leading-none">C</span>
          </div>
          <span className="font-body text-[11px] font-light tracking-[0.22em] uppercase text-chalk">
            The Corporate
          </span>
        </a>
        <span className="hidden min-[560px]:block font-body text-[10px] font-normal tracking-[0.14em] uppercase text-stone">
          Supplier Sustainability Portal · 2026
        </span>
      </div>
    </nav>
  )
}
