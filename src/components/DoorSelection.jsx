import Nav from './Nav'
import Footer from './Footer'

export default function DoorSelection({ onSelectDoor1, onSelectDoor2, onBack }) {
  return (
    <div>
      <Nav />
      <section className="bg-chalk py-20 min-h-[60vh]">
        <div className="tc-page">
          <button onClick={onBack} className="tc-link text-[12px] font-body uppercase tracking-[0.1em] mb-10 inline-block">
            &larr; Back to landing page
          </button>

          <p className="tc-subhead mb-4">Complete the Questionnaire</p>
          <h1 className="tc-h2 text-[clamp(26px,3.5vw,38px)] mb-4">Choose how you want to submit.</h1>
          <p className="tc-body text-stone max-w-[640px] mb-14">
            Both paths cover the same seven sections. Nothing you enter is stored or sent anywhere —
            it stays in this browser tab until you close it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[860px]">
            <div className="tc-card-elevated flex flex-col">
              <div className="bg-ink px-3 py-1 inline-block self-start mb-4">
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-lime font-body">Door 1</span>
              </div>
              <div className="text-[18px] font-medium text-ink mb-3 font-body">Fill in the portal</div>
              <div className="text-[13px] font-light text-stone leading-relaxed mb-8 flex-1">
                A guided form, section by section. Dropdowns, number fields, and required markers
                match the questionnaire workbook exactly. You cannot move on while a required
                answer is missing or invalid.
              </div>
              <button onClick={onSelectDoor1} className="tc-btn-primary w-full text-center block">
                Start the Guided Form
              </button>
            </div>

            <div className="tc-card-elevated flex flex-col">
              <div className="bg-chalk border border-stone/40 px-3 py-1 inline-block self-start mb-4">
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-stone font-body">Door 2</span>
              </div>
              <div className="text-[18px] font-medium text-ink mb-3 font-body">Download and upload</div>
              <div className="text-[13px] font-light text-stone leading-relaxed mb-8 flex-1">
                Download the Excel workbook, complete it offline at your own pace, then upload it
                back here. We check the structure matches the 2026 template before you review and
                submit.
              </div>
              <button onClick={onSelectDoor2} className="tc-btn-secondary w-full text-center block">
                Download and Upload
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
