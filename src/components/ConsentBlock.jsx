import { CONSENT_LABEL, DATA_STATEMENT } from '../data/contactSchema'

// GDPR checkpoint. Appears immediately above the final submit control on both
// routes (CLAUDE.md Hard Rules). Submission is blocked until it is checked.
export default function ConsentBlock({ checked, error, onChange, disabled }) {
  return (
    <div className="tc-card">
      <p className="tc-label mb-3">How your data is used</p>
      <p className="text-[13px] font-light leading-relaxed text-graphite mb-5">{DATA_STATEMENT}</p>
      <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 shrink-0 accent-black cursor-pointer"
          aria-invalid={error ? 'true' : undefined}
        />
        <span className="text-[13px] font-light leading-relaxed text-ink">{CONSENT_LABEL}</span>
      </label>
      {error && <p className="text-[12px] text-ink mt-3 pl-7">{error}</p>}
    </div>
  )
}
