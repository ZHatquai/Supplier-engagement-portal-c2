import { useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import ContactFields from './ContactFields'
import { EMPTY_CONTACT, validateContact } from '../data/contactSchema'

// Questionnaire route, opening step. Nothing is written to the database here —
// these values are held in session state and carried through Door Selection and
// whichever door is chosen, into the shared Review screen (product-spec v3.0 §8).
export default function QuestionnaireCapture({ initialValues, onContinue, onBack }) {
  const [values, setValues] = useState(initialValues ?? EMPTY_CONTACT)
  const [errors, setErrors] = useState({})

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }))
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  function handleContinue() {
    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onContinue(values)
  }

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

          <p className="tc-subhead mb-2">Questionnaire Route</p>
          <h1 className="tc-h2 text-[clamp(26px,3.5vw,34px)] mb-4">Tell us who you are.</h1>
          <p className="tc-body text-graphite mb-10 max-w-[600px]">
            We need your company and contact details before you start. You will choose how to
            complete the questionnaire on the next screen, and nothing is submitted until you
            review your answers at the end.
          </p>

          <div className="tc-card-elevated">
            <p className="tc-label mb-6">Company and contact</p>
            <ContactFields values={values} errors={errors} onChange={handleChange} />
          </div>

          <div className="flex items-center justify-end mt-10 pt-8 border-t border-stone/30">
            <button onClick={handleContinue} className="tc-btn-primary">
              Continue &rarr;
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
