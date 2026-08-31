export default function Footer() {
  return (
    <footer className="bg-ink pt-16 pb-16 border-t border-white/[0.06]">
      <div className="tc-page flex items-start justify-between gap-10 flex-wrap">
        <div>
          <div className="font-body text-[10px] font-light tracking-[0.22em] uppercase text-chalk mb-2">
            The Corporate
          </div>
          <div className="text-[11px] font-light text-stone max-w-[260px] leading-relaxed">
            Engineering a sustainable future. Net-Zero by 2045 across all scopes of operation.
          </div>
        </div>
        <div className="text-right text-[10px] font-light tracking-[0.1em] text-stone leading-loose [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-chalk max-[768px]:text-left">
          <div>ESRS / CSRD Aligned · Version 2.0</div>
          <div>Supplier Programme · 2026</div>
          <div className="mt-2">Scope 3: 71% of total footprint · location-based · 2023 base year</div>
          <div className="mt-2">
            <a href="mailto:sustainability@thecorporate.com">sustainability@thecorporate.com</a>
          </div>
          <div className="mt-2">No data entered in this portal is stored or transmitted.</div>
        </div>
      </div>
      <div className="h-[0.5px] bg-white/[0.15] my-6 tc-page" />
      <div className="tc-page flex items-center justify-between flex-wrap gap-4">
        <div className="text-[10px] font-light text-stone tracking-[0.1em]">
          © 2026 The Corporate. Confidential. For Tier 1 Supplier use only.
        </div>
        <div className="inline-block border border-stone/30 px-2.5 py-1">
          <span className="text-[9px] tracking-[0.16em] uppercase text-stone">ESRS Compliant · CSRD 2026</span>
        </div>
      </div>
    </footer>
  )
}
