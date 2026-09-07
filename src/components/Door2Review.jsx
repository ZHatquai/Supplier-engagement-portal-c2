import Nav from './Nav'
import Footer from './Footer'
import { SECTIONS } from '../data/questionnaireSchema'

export default function Door2Review({ answers, onSubmit, onReupload }) {
  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[760px]">
          <p className="tc-subhead mb-2">Door 2 — Review</p>
          <h1 className="tc-h2 text-[28px] mb-4">Check what we read from your file.</h1>
          <p className="tc-body text-graphite mb-10 max-w-[600px]">
            The structure matched the 2026 template. Blank answers are shown as empty below &mdash;
            review before you submit.
          </p>

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

          <div className="flex items-center justify-between mt-14 pt-8 border-t border-stone/30">
            <button onClick={onReupload} className="tc-btn-ghost">
              &larr; Re-upload a corrected file
            </button>
            <button onClick={onSubmit} className="tc-btn-primary">
              Submit
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
