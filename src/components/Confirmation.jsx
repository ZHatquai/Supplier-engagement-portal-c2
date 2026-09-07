import Nav from './Nav'
import Footer from './Footer'
import SubmissionSummary from './SubmissionSummary'

// Questionnaire route only. The EcoVadis route confirms in place on its capture
// screen and hands off to EcoVadis (product-spec v3.0 §8).
export default function Confirmation({ contact, answers, submission, onReturnHome }) {
  const needsReview = submission?.status === 'needs_review'
  const superseded = submission?.status === 'superseded'

  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          <p className="tc-subhead mb-2">Submitted</p>
          <h1 className="tc-h2 text-[32px] mb-4">Thank you. Your submission is recorded.</h1>

          <div className="tc-card-elevated mb-6 border-l-2 border-l-ink">
            <p className="text-[13px] font-light leading-relaxed text-ink mb-3">
              The Corporate now holds this submission. Your EHS and procurement contacts will review
              it as part of the 2026 supplier programme. No email is sent — this on-screen
              confirmation is your only receipt, so keep the reference below.
            </p>
            <p className="text-[12px] text-graphite">
              Reference: <span className="font-medium text-ink">{submission?.id ?? '—'}</span>
            </p>
          </div>

          {(needsReview || superseded) && (
            <div className="tc-card mb-10">
              <p className="tc-label mb-2">Status</p>
              <p className="text-[13px] font-light leading-relaxed text-ink">
                {needsReview
                  ? 'Another submission already existed for your company on this route. Both are flagged for manual review by The Corporate — you do not need to do anything further.'
                  : 'An EcoVadis scorecard is already on file for your company and takes precedence, so this questionnaire has been recorded as superseded.'}
              </p>
            </div>
          )}

          <div className={needsReview || superseded ? '' : 'mt-10'}>
            <SubmissionSummary contact={contact} answers={answers} />
          </div>

          <div className="mt-14 pt-8 border-t border-stone/30">
            <button onClick={onReturnHome} className="tc-btn-secondary">
              Return to landing page
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
