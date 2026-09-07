import { useEffect, useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import ConsentBlock from './ConsentBlock'
import DuplicateWarning from './DuplicateWarning'
import SubmissionSummary from './SubmissionSummary'
import { checkDuplicate, submitSubmission } from '../lib/submissionsApi'

// Shared final screen for both doors (product-spec v3.0 §8). The duplicate check
// runs on arrival so the warning is on screen before the supplier commits; the
// authoritative check and the status write happen server-side at submit.
export default function ReviewSubmit({ door, contact, answers, onBack, onSubmitted }) {
  const [warning, setWarning] = useState('none')
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)

  const companyName = contact?.company_name

  useEffect(() => {
    let cancelled = false
    checkDuplicate({ companyName, route: 'questionnaire' }).then((result) => {
      if (!cancelled) setWarning(result.duplicate ? result.kind : 'none')
    })
    return () => {
      cancelled = true
    }
  }, [companyName])

  async function handleSubmit() {
    if (busy) return
    if (!consent) {
      setConsentError('Consent is required before you can submit.')
      return
    }

    setBusy(true)
    setFailure(null)
    try {
      const row = await submitSubmission({
        route: 'questionnaire',
        company_name: contact.company_name,
        contact_name: contact.contact_name,
        contact_email: contact.contact_email,
        contact_phone: contact.contact_phone,
        job_title: contact.job_title,
        department: contact.department,
        questionnaire_answers: answers,
        consent: true,
      })
      onSubmitted(row)
    } catch (error) {
      setFailure(error.message)
      setBusy(false)
    }
  }

  const isDoor2 = door === 'door2'

  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          <p className="tc-subhead mb-2">{isDoor2 ? 'Door 2 — Review' : 'Door 1 — Review'}</p>
          <h1 className="tc-h2 text-[28px] mb-4">
            {isDoor2 ? 'Check what we read from your file.' : 'Check your answers before submitting.'}
          </h1>
          <p className="tc-body text-graphite mb-10 max-w-[600px]">
            {isDoor2
              ? 'The structure matched the 2026 template. Blank answers are shown as empty below — review before you submit.'
              : 'This is everything you entered. Go back to change anything before you submit.'}
          </p>

          <SubmissionSummary contact={contact} answers={answers} />

          <div className="flex flex-col gap-8 mt-8">
            <DuplicateWarning kind={warning} companyName={companyName} route="questionnaire" />

            <ConsentBlock
              checked={consent}
              error={consentError}
              disabled={busy}
              onChange={(next) => {
                setConsent(next)
                if (next) setConsentError(null)
              }}
            />

            {failure && (
              <div className="tc-card-elevated border-l-2 border-l-ink">
                <p className="tc-label mb-2">Not submitted</p>
                <p className="text-[13px] font-light leading-relaxed text-ink">{failure}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap mt-14 pt-8 border-t border-stone/30">
            <button onClick={onBack} disabled={busy} className="tc-btn-ghost">
              &larr; {isDoor2 ? 'Re-upload a corrected file' : 'Back to the form'}
            </button>
            <button onClick={handleSubmit} disabled={busy} className="tc-btn-primary">
              {busy ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
