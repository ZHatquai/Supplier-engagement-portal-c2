import Nav from './Nav'
import Footer from './Footer'

const ARROW = (
  <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-[1.5]">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function Landing({ onStartQuestionnaire }) {
  return (
    <div>
      <Nav />

      {/* HERO */}
      <section className="bg-ink pt-24 pb-16 relative overflow-hidden">
        <div className="tc-page">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-ink border border-stone/40 px-3 py-1 inline-block">
              <span className="font-body text-[10px] font-medium tracking-[0.18em] uppercase text-chalk">
                Supplier Programme 2026
              </span>
            </div>
            <div className="flex-1 h-[0.5px] bg-stone/25" />
          </div>

          <h1 className="tc-h1 text-[clamp(36px,5vw,56px)] text-chalk max-w-[760px] mb-10">
            We don&rsquo;t just manufacture products.
            <br />
            We <span className="border-b-2 border-lime pb-0.5">engineer</span> a sustainable future.
          </h1>

          <p className="font-body text-[16px] font-light leading-[1.8] text-stone max-w-[580px] mb-10">
            Our 2045 Net-Zero goal is a shared journey. This portal is your starting point &mdash;
            understand what we are asking, why it matters, and which submission path applies to you.
          </p>

          <div className="flex gap-16 flex-wrap border-t border-stone/20 pt-10">
            <Stat value="690,000" label="tCO2e Total Footprint (2023)" />
            <Stat value="71%" label="Scope 3 — Value Chain" />
            <Stat value="2045" label="Net-Zero Target Year" />
            <Stat value="500+" label="Tier 1 Suppliers" />
          </div>
          <p className="mt-4 text-[12px] text-stone tracking-[0.04em]">
            Scope 3 is 71% of The Corporate&rsquo;s total carbon footprint (location-based, 2023 base year).
          </p>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-white py-24">
        <div className="tc-page">
          <p className="tc-subhead mb-6">Why We Are Asking</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="tc-h2 text-[clamp(26px,3.5vw,38px)] max-w-[440px]">
                This is driven by regulation, and by ambition.
              </h2>
              <p className="tc-body mt-6 text-stone">
                71% of The Corporate&rsquo;s total carbon footprint sits in our value chain &mdash; in
                the products and services our Tier 1 suppliers provide. Reaching Net-Zero by 2045 is
                not possible without visibility into, and collaboration with, our supply base.
              </p>
              <p className="tc-body mt-4 text-stone">
                This assessment is the foundation of that visibility. It is aligned with the EU&rsquo;s
                Corporate Sustainability Reporting Directive (CSRD) and the European Sustainability
                Reporting Standards (ESRS), both of which require companies to report on value chain
                impacts beginning in 2026.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <WhyCard
                tag="CSRD / ESRS"
                title="Regulatory Requirement"
                body="The EU Corporate Sustainability Reporting Directive mandates disclosure of Scope 3 emissions and value chain sustainability performance. Non-compliance creates material financial and reputational risk for The Corporate — and by extension, for you."
              />
              <WhyCard
                tag="Double Materiality"
                title="Impact & Financial Materiality"
                body="Our 2026 Double Materiality Assessment identified three primary supplier risk areas: E1 (Climate), E2 (PFAS / Pollution), and E3 (Water Stress). These are not hypothetical risks — they carry direct financial exposure in the form of carbon taxes, REACH bans, and supply chain disruptions."
              />
              <WhyCard
                tag="Partnership"
                title="A Shared Journey"
                body="Suppliers who demonstrate strong sustainability performance receive preferential status in The Corporate's procurement scoring. This is not a compliance exercise — it is the foundation of a long-term, resilient supply partnership."
              />
            </div>
          </div>
        </div>
      </section>

      {/* TWO ROUTES */}
      <section className="bg-chalk py-24">
        <div className="tc-page">
          <div className="text-center max-w-[560px] mx-auto mb-16">
            <p className="tc-subhead mb-4">Your Submission Path</p>
            <h2 className="tc-h2 text-[clamp(26px,3.5vw,38px)]">Two routes. One destination.</h2>
            <p className="tc-body mt-4 text-stone text-[14px]">
              We respect your time. If you already hold a current EcoVadis Scorecard, you have an
              expedited path. Otherwise, complete the questionnaire in the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[860px] mx-auto">
            {/* Path A — EcoVadis */}
            <div className="tc-card-elevated flex flex-col">
              <div className="bg-ink px-3 py-1 inline-block self-start mb-4">
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-lime font-body">
                  Fastest Path — EcoVadis
                </span>
              </div>
              <div className="text-[15px] font-medium text-ink mb-3">Submit Your Scorecard</div>
              <div className="text-[13px] font-light text-stone leading-relaxed mb-6 flex-1">
                Suppliers with a current EcoVadis Scorecard (score &ge; 45) are exempt from the
                detailed technical questionnaire. Submit your scorecard directly on EcoVadis.
                <br />
                <br />
                Estimated time: <strong className="text-ink font-medium">5 minutes</strong>
              </div>
              <a
                href="https://ecovadis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="tc-btn-primary w-full text-center block"
              >
                Submit EcoVadis Scorecard
              </a>
            </div>

            {/* Path B — Questionnaire */}
            <div className="tc-card-elevated flex flex-col">
              <div className="bg-chalk border border-stone/40 px-3 py-1 inline-block self-start mb-4">
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-stone font-body">
                  Path B — Full Assessment
                </span>
              </div>
              <div className="text-[15px] font-medium text-ink mb-3">Complete the Questionnaire</div>
              <div className="text-[13px] font-light text-stone leading-relaxed mb-6 flex-1">
                Complete the Smart Sustainability Questionnaire covering 7 sections aligned to
                ESRS E1, E2, E3, E4, E5, S2, and G1 &mdash; filled in the portal, or downloaded,
                completed offline, and uploaded back.
                <br />
                <br />
                Estimated time: <strong className="text-ink font-medium">45&ndash;60 minutes</strong>
              </div>
              <button onClick={onStartQuestionnaire} className="tc-btn-secondary w-full text-center block">
                Complete the Questionnaire
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-white py-24">
        <div className="tc-page">
          <p className="tc-subhead mb-4">Programme Timeline</p>
          <h2 className="tc-h2 text-[clamp(26px,3.5vw,38px)]">What happens next.</h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 border border-stone/40">
            <TimelineStep num="01" title="Portal Launch" body="You receive this link and select your submission path." date="April 2026" active />
            <TimelineStep num="02" title="Data Submission" body="Submit scorecard or complete questionnaire. 100% Tier 1 response required." date="Deadline: 30 Sep 2026" />
            <TimelineStep num="03" title="Review & Scoring" body="Our EHS and Procurement teams review submissions and flag gaps." date="Q4 2026" />
            <TimelineStep num="04" title="Partnership Plans" body="Joint decarbonisation and improvement plans agreed with prioritised suppliers." date="Q1 2027" last />
          </div>
        </div>
      </section>

      {/* KEY RESOURCES */}
      <section className="bg-linen py-24">
        <div className="tc-page">
          <p className="tc-subhead mb-4">Key Resources</p>
          <h2 className="tc-h2 text-[clamp(26px,3.5vw,38px)]">Everything you need.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <ResourceCard
              href="#"
              label="Document"
              title="Supplier Code of Conduct"
              desc="Our standards for ethical business conduct, labour rights, and environmental responsibility. All Tier 1 suppliers must have a signed copy on file."
              cta="View Document"
            />
            <ResourceCard
              href="#"
              label="Policy"
              title="Global Environmental Policy"
              desc="The Corporate's commitments on climate, water, PFAS, and circular economy — the framework that defines what we expect from our value chain partners."
              cta="View Policy"
            />
            <ResourceCard
              href="mailto:sustainability@thecorporate.com?subject=Supplier Portal Help Desk Query"
              label="Support"
              title="EHS Help Desk"
              desc="Questions about specific ESRS requirements, measurement methodology, or technical aspects of the questionnaire? Contact our Environment, Health & Safety team directly."
              cta="Contact EHS"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-[36px] font-bold text-chalk leading-none mb-1">{value}</div>
      <div className="text-[10px] font-normal tracking-[0.16em] uppercase text-stone">{label}</div>
    </div>
  )
}

function WhyCard({ tag, title, body }) {
  return (
    <div className="tc-card">
      <div className="bg-ink px-2.5 py-1 inline-block mb-2">
        <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-chalk font-body">{tag}</span>
      </div>
      <div className="text-[13px] font-medium text-ink mb-1">{title}</div>
      <div className="text-[13px] font-light leading-relaxed text-stone">{body}</div>
    </div>
  )
}

function TimelineStep({ num, title, body, date, active, last }) {
  return (
    <div
      className={`p-6 relative ${last ? '' : 'border-b md:border-b-0 md:border-r border-stone/40'} ${
        active ? 'bg-ink' : ''
      }`}
    >
      <div className={`font-display text-[28px] font-bold leading-none mb-2 ${active ? 'text-lime' : 'text-linen'}`}>
        {num}
      </div>
      <div className={`text-[13px] font-medium mb-1 ${active ? 'text-chalk' : 'text-ink'}`}>{title}</div>
      <div className={`text-[12px] font-light leading-relaxed mb-2 ${active ? 'text-stone' : 'text-stone'}`}>
        {body}
      </div>
      <div className="text-[10px] tracking-[0.14em] uppercase text-stone">{date}</div>
    </div>
  )
}

function ResourceCard({ href, label, title, desc, cta }) {
  const external = href.startsWith('mailto:')
  return (
    <a
      href={href}
      {...(external ? {} : {})}
      className="tc-card-elevated no-underline flex flex-col gap-2 hover:border-ink transition-colors"
    >
      <div className="w-8 h-8 border border-stone/40 flex items-center justify-center mb-1">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-stone fill-none stroke-[1.5]">
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <div className="text-[10px] font-normal tracking-[0.16em] uppercase text-stone">{label}</div>
      <div className="text-[14px] font-medium text-ink">{title}</div>
      <div className="text-[12px] font-light leading-relaxed text-stone flex-1">{desc}</div>
      <div className="text-[11px] tracking-[0.12em] uppercase text-stone flex items-center gap-1.5 mt-2">
        {cta}
        {ARROW}
      </div>
    </a>
  )
}
