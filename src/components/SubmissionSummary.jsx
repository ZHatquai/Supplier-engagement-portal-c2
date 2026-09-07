import { CONTACT_FIELDS } from '../data/contactSchema'
import { SECTIONS } from '../data/questionnaireSchema'

// Shared read-only rendering of a questionnaire submission — identity first,
// then every S2–S7 answer. Used by both the Review screen and the Confirmation
// screen so the two can never show different things.
export default function SubmissionSummary({ contact, answers }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="tc-card-elevated">
        <p className="tc-subhead mb-1">Identity</p>
        <div className="text-[15px] font-medium text-ink mb-4 font-body">Company and contact</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACT_FIELDS.map((field) => (
            <div key={field.id} className="border-t border-stone/20 pt-3">
              <div className="tc-label mb-1">{field.label}</div>
              <div className="text-[14px] font-body font-light text-ink break-words">
                {contact?.[field.id] || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} className="tc-card-elevated">
          <p className="tc-subhead mb-1">{section.esrs}</p>
          <div className="text-[15px] font-medium text-ink mb-4 font-body">
            {section.id} &mdash; {section.title}
          </div>
          <div className="flex flex-col gap-4">
            {section.fields.map((field) => (
              <div key={field.id} className="border-t border-stone/20 pt-3 first:border-t-0 first:pt-0">
                <div className="tc-label mb-1">{field.label}</div>
                <div
                  className={`text-[14px] font-body break-words ${
                    answers[field.id] ? 'text-ink font-light' : 'text-graphite italic'
                  }`}
                >
                  {answers[field.id] || 'Empty'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
