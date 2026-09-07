import { useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import FieldInput from './FieldInput'
import { SECTIONS, validateSection } from '../data/questionnaireSchema'

export default function Door1Wizard({ onSubmit, onBack }) {
  const [sectionIndex, setSectionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})

  const section = SECTIONS[sectionIndex]
  const isLast = sectionIndex === SECTIONS.length - 1

  function handleChange(fieldId, value) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  function validateCurrentSection() {
    const sectionErrors = validateSection(section, answers)
    setErrors(sectionErrors)
    return Object.keys(sectionErrors).length === 0
  }

  function handleNext() {
    if (!validateCurrentSection()) return
    setSectionIndex((i) => Math.min(i + 1, SECTIONS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackSection() {
    if (sectionIndex === 0) {
      onBack()
      return
    }
    setSectionIndex((i) => Math.max(i - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit() {
    if (!validateCurrentSection()) return
    onSubmit(answers)
  }

  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          {/* Progress */}
          <div className="flex items-center gap-1 mb-10">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="flex-1">
                <div className={`h-[3px] ${i <= sectionIndex ? 'bg-ink' : 'bg-stone/30'}`} />
                <div className={`text-[10px] mt-1.5 tracking-[0.1em] uppercase ${i === sectionIndex ? 'text-ink' : 'text-graphite'}`}>
                  {s.id}
                </div>
              </div>
            ))}
          </div>

          <p className="tc-subhead mb-2">{section.esrs}</p>
          <h1 className="tc-h2 text-[28px] mb-2">{section.title}</h1>
          <p className="text-[13px] text-graphite mb-10">
            Section {sectionIndex + 1} of {SECTIONS.length}. Fields marked * are required.
          </p>

          <div className="flex flex-col gap-8">
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={answers[field.id]}
                error={errors[field.id]}
                onChange={handleChange}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-14 pt-8 border-t border-stone/30">
            <button onClick={handleBackSection} className="tc-btn-ghost">
              &larr; Back
            </button>
            {isLast ? (
              <button onClick={handleSubmit} className="tc-btn-primary">
                Submit
              </button>
            ) : (
              <button onClick={handleNext} className="tc-btn-primary">
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
