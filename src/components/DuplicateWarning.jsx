// "Warn but allow" (product-spec v3.0 §9). The supplier is told what will happen
// to their submission and can still proceed — this never blocks a submit.
export default function DuplicateWarning({ kind, companyName, route }) {
  if (kind !== 'same_route' && kind !== 'cross_route') return null

  const consequence =
    kind === 'same_route'
      ? 'Both submissions will be flagged for manual review by The Corporate, and neither will be treated as the authoritative record until that review is done.'
      : route === 'ecovadis'
        ? 'Your EcoVadis scorecard takes precedence, so the earlier questionnaire submission will be marked as superseded.'
        : 'The existing EcoVadis scorecard takes precedence, so this questionnaire submission will be recorded but marked as superseded.'

  return (
    <div className="tc-card-elevated border-l-2 border-l-lime" role="status">
      <p className="tc-label mb-2">Existing submission found</p>
      <p className="text-[13px] font-light leading-relaxed text-ink">
        A submission already exists for {companyName ? <strong className="font-medium">{companyName}</strong> : 'this company'}.{' '}
        {consequence}
      </p>
      <p className="text-[13px] font-light leading-relaxed text-graphite mt-3">
        You can still submit. If this was not intended, contact your procurement or EHS
        representative at The Corporate first.
      </p>
    </div>
  )
}
