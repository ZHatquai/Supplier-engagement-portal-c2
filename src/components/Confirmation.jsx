import Nav from './Nav'
import Footer from './Footer'
import { SECTIONS } from '../data/questionnaireSchema'

export default function Confirmation({ answers, onReturnHome }) {
  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          <p className="tc-subhead mb-2">Submitted</p>
          <h1 className="tc-h2 text-[32px] mb-4">Thank you. Here is what you submitted.</h1>
          <div className="tc-card-elevated mb-10 border-l-2 border-l-ink">
            <p className="text-[13px] text-ink leading-relaxed">
              This is an on-screen confirmation only. No email has been sent and nothing has been
              stored &mdash; The Corporate has no record of this submission. Closing this tab clears
              the session completely.
            </p>
          </div>

          <div className="flex flex-col gap-8">
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
                      <div className={`text-[14px] font-body ${answers[field.id] ? 'text-ink font-light' : 'text-graphite italic'}`}>
                        {answers[field.id] || 'Empty'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
