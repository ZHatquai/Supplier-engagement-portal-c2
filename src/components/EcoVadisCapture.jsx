import { useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import ContactFields from './ContactFields'
import ConsentBlock from './ConsentBlock'
import DuplicateWarning from './DuplicateWarning'
import { ECOVADIS_URL, EMPTY_CONTACT, validateContact, validateUrl } from '../data/contactSchema'
import { checkDuplicate, submitSubmission } from '../lib/submissionsApi'

// EcoVadis route, step 1 and only step. Captures identity plus the scorecard
// link, writes the row, then hands off to EcoVadis in a new tab. The portal tab
// stays open (product-spec v3.0 §8).
export default function EcoVadisCapture({ onBack }) {
  const [values, setValues] = useState({ ...EMPTY_CONTACT, ecovadis_link: '' })
  const [errors, setErrors] = useState({})
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(null)
  const [warning, setWarning] = useState(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const [openManually, setOpenManually] = useState(false)

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }))
    setFailure(null)
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    // A changed company name invalidates the duplicate check behind the warning.
    if (id === 'company_name') setWarning(null)
  }

  function validate() {
    const nextErrors = validateContact(values)
    const linkError = validateUrl(values.ecovadis_link)
    if (linkError) nextErrors.ecovadis_link = linkError
    setErrors(nextErrors)

    const missingConsent = !consent
    setConsentError(missingConsent ? 'Consent is required before you can submit.' : null)

    return Object.keys(nextErrors).length === 0 && !missingConsent
  }

  async function handleSubmit() {
    if (busy) return
    if (!validate()) return

    setBusy(true)
    setFailure(null)

    // First click on a company that already has a submission stops here and
    // warns. The next click goes through — warn but allow (v3.0 §9).
    if (!warning) {
      const result = await checkDuplicate({ companyName: values.company_name, route: 'ecovadis' })
      if (result.duplicate) {
        setWarning(result.kind)
        setBusy(false)
        return
      }
      setWarning('none')
    }

    // Opened synchronously enough to survive popup blocking in most browsers;
    // if it was blocked we show a manual link once the row is written.
    const tab = window.open('', '_blank')

    try {
      const row = await submitSubmission({
        route: 'ecovadis',
        company_name: values.company_name,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        job_title: values.job_title,
        department: values.department,
        ecovadis_link: values.ecovadis_link,
        consent: true,
      })
      if (tab) {
        tab.opener = null
        tab.location.replace(ECOVADIS_URL)
      } else {
        setOpenManually(true)
      }
      setSubmitted(row)
    } catch (error) {
      if (tab) tab.close()
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  const warned = warning === 'same_route' || warning === 'cross_route'

  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          <button
            onClick={onBack}
            className="tc-link text-[12px] font-body uppercase tracking-[0.1em] mb-10 inline-block"
          >
            &larr; Back to landing page
          </button>

          <p className="tc-subhead mb-2">EcoVadis Route</p>
          <h1 className="tc-h2 text-[clamp(26px,3.5vw,34px)] mb-4">Tell us who you are.</h1>
          <p className="tc-body text-graphite mb-10 max-w-[600px]">
            We need your company and contact details, and a link to your current EcoVadis Scorecard,
            before we send you across to EcoVadis. This takes about two minutes.
          </p>

          {submitted ? (
            <div className="tc-card-elevated border-l-2 border-l-ink">
              <p className="tc-label mb-2">Submitted</p>
              <h2 className="tc-h2 text-[22px] mb-4">Your details are with The Corporate.</h2>
              <p className="text-[13px] font-light leading-relaxed text-ink mb-4">
                {openManually
                  ? 'Your browser blocked the new tab. Open EcoVadis using the button below to complete your scorecard submission.'
                  : 'EcoVadis has opened in a new tab. Complete your scorecard submission there — this tab can be closed.'}
              </p>
              <p className="text-[12px] text-graphite mb-6">
                Reference: <span className="font-medium text-ink">{submitted.id}</span>. No email is
                sent. Keep this reference if you need to contact The Corporate about this submission.
              </p>
              <a href={ECOVADIS_URL} target="_blank" rel="noopener noreferrer" className="tc-btn-primary">
                Go to EcoVadis
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="tc-card-elevated">
                <p className="tc-label mb-6">Company and contact</p>
                <ContactFields values={values} errors={errors} onChange={handleChange} disabled={busy} />
              </div>

              <div className="tc-card-elevated">
                <label htmlFor="ecovadis_link" className="tc-label block mb-2">
                  EcoVadis scorecard link
                  <span className="text-ink"> *</span>
                </label>
                <p className="text-[13px] font-light text-graphite mb-3">
                  Paste the full URL of your current scorecard, issued within the last 12 months.
                </p>
                <input
                  id="ecovadis_link"
                  name="ecovadis_link"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  disabled={busy}
                  value={values.ecovadis_link}
                  onChange={(e) => handleChange('ecovadis_link', e.target.value)}
                  className={`tc-input ${errors.ecovadis_link ? 'tc-error' : ''}`}
                  aria-invalid={errors.ecovadis_link ? 'true' : undefined}
                />
                {errors.ecovadis_link && (
                  <p className="text-[12px] text-ink mt-2">{errors.ecovadis_link}</p>
                )}
              </div>

              {warned && (
                <DuplicateWarning kind={warning} companyName={values.company_name} route="ecovadis" />
              )}

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

              <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-stone/30">
                <p className="text-[12px] text-graphite max-w-[340px]">
                  Submitting stores your details and opens EcoVadis in a new tab. This tab stays open.
                </p>
                <button onClick={handleSubmit} disabled={busy} className="tc-btn-primary">
                  {busy
                    ? 'Submitting…'
                    : warned
                      ? 'Submit anyway and Go to EcoVadis'
                      : 'Submit and Go to EcoVadis'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}
