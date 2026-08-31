import { useRef, useState } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import { parseUploadedFile } from '../lib/parseUpload'

const XLSX_ASSET = '/assets/The_Corporate_Supplier_Questionnaire_2026.xlsx'

export default function Door2Upload({ onParsed, onBack }) {
  const [rejection, setRejection] = useState(null)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // no file is retained after parsing — clear the input's own reference too
    if (!file) return

    setParsing(true)
    setRejection(null)
    const result = await parseUploadedFile(file)
    setParsing(false)

    if (result.ok) {
      onParsed(result.answers)
    } else {
      setRejection(result.reason)
    }
  }

  return (
    <div>
      <Nav />
      <section className="bg-chalk py-16 min-h-[70vh]">
        <div className="tc-page max-w-[720px]">
          <button onClick={onBack} className="tc-link text-[12px] font-body uppercase tracking-[0.1em] mb-10 inline-block">
            &larr; Back
          </button>

          <p className="tc-subhead mb-2">Door 2</p>
          <h1 className="tc-h2 text-[28px] mb-4">Download and upload.</h1>
          <p className="tc-body text-stone mb-10 max-w-[600px]">
            Download the workbook, complete it offline, then upload the finished file. We check it
            against the 2026 template before showing you a review screen. Nothing is uploaded to a
            server &mdash; the file is read and checked entirely in this browser tab.
          </p>

          <div className="tc-card-elevated mb-8">
            <div className="text-[13px] font-medium text-ink mb-3 font-body">Step 1 — Download</div>
            <p className="text-[13px] text-stone leading-relaxed mb-6">
              The_Corporate_Supplier_Questionnaire_2026.xlsx contains all seven sections with the
              dropdowns and instructions built in.
            </p>
            <a href={XLSX_ASSET} download className="tc-btn-secondary inline-block">
              Download Questionnaire (Excel)
            </a>
          </div>

          <div className="tc-card-elevated">
            <div className="text-[13px] font-medium text-ink mb-3 font-body">Step 2 — Upload</div>
            <p className="text-[13px] text-stone leading-relaxed mb-6">
              Accepted formats: .xlsx or .csv. Blank cells in an otherwise matching file are fine
              &mdash; you will see the gaps on the review screen before submitting.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFile}
              className="tc-input cursor-pointer"
              disabled={parsing}
            />
            {parsing && <p className="text-[12px] text-stone mt-3">Reading file&hellip;</p>}
          </div>

          {rejection && (
            <div className="tc-card-elevated mt-8 border-l-2 border-l-ink">
              <div className="text-[13px] font-medium text-ink mb-2 font-body">File not accepted</div>
              <p className="text-[13px] text-stone leading-relaxed mb-4">{rejection}</p>
              <div className="flex gap-3 flex-wrap">
                <a href={XLSX_ASSET} download className="tc-btn-secondary">
                  Re-download the template
                </a>
                <button onClick={() => inputRef.current?.click()} className="tc-btn-ghost">
                  Try another file
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
