import React from 'react'

const INITIAL_STATE = {
  case_number: '',
  fir_details: '',
  crime_description: '',
  accused_background: '',
  evidence_summary: '',
  accused_name: '',
  age: '',
  gender: 'Male',
  criminal_history: 'None',
  severity: 'Low',
  evidence_strength: 'Weak',
  flight_risk: 'Low',
}

/* ── Reusable field label ─────────────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="field-label">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

/* ── Section divider ─────────────────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <fieldset className="border-0 p-0 m-0">
    <legend className="w-full flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-ink uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>
      <span className="flex-1 h-px bg-border" />
    </legend>
    {children}
  </fieldset>
)

/* ── Loading spinner ─────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

/* ── Main component ────────────────────────────────────────────────────────── */
export default function InputForm({ onSubmit, loading, history = [], onClearHistory }) {
  const [form, setForm] = React.useState(INITIAL_STATE)
  const [ipcTags, setIpcTags] = React.useState([])
  const [ipcInput, setIpcInput] = React.useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addTag = (raw) => {
    const tag = raw.trim().replace(/,+$/, '').replace(/^section\s+/i, 'Section ')
    if (tag && !ipcTags.includes(tag)) setIpcTags((p) => [...p, tag])
    setIpcInput('')
  }

  const handleIpcKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && ipcInput.trim()) {
      e.preventDefault()
      addTag(ipcInput)
    }
    if (e.key === 'Backspace' && !ipcInput && ipcTags.length > 0) {
      setIpcTags((p) => p.slice(0, -1))
    }
  }

  const removeTag = (tag) => setIpcTags((p) => p.filter((t) => t !== tag))

  const handleSubmit = (e) => {
    e.preventDefault()
    const firText = [form.fir_details, form.crime_description].filter(Boolean).join('. ')
    if (!firText.trim()) return

    onSubmit({
      fir_details: firText,
      ipc_sections: ipcTags.join(', ') || 'Not specified',
      accused_name: form.accused_name || 'Unknown',
      age: Number(form.age) || 30,
      gender: form.gender,
      criminal_history: form.accused_background || form.criminal_history,
      severity: form.severity,
      evidence_strength: form.evidence_strength,
      flight_risk: form.flight_risk,
    })
  }

  return (
    <form onSubmit={handleSubmit} id="case-analysis-form" noValidate>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">New Case Analysis</h1>
        <p className="text-sm text-ink-muted mt-1">
          Enter comprehensive case details to initiate the BERT-driven risk assessment and bail eligibility prediction.
        </p>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">

        {/* ── Left: Main form ────────────────────────────────────────────── */}
        <div className="card p-6 space-y-7">

          {/* CASE INFO */}
          <Section title="Case Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Case Number</Label>
                <input
                  name="case_number"
                  type="text"
                  value={form.case_number}
                  onChange={handleChange}
                  placeholder="e.g., CRL/2024/4590"
                  className="form-control"
                />
              </div>
              <div>
                <Label required>FIR Reference</Label>
                <input
                  name="fir_details"
                  type="text"
                  value={form.fir_details}
                  onChange={handleChange}
                  placeholder="FIR No. 102/2024, PS Central"
                  className="form-control"
                />
              </div>
            </div>

            {/* IPC tag input */}
            <div className="mt-4">
              <Label>IPC Sections (Offenses Cited)</Label>
              <div className="tag-input-wrapper">
                {ipcTags.map((tag) => (
                  <span key={tag} className="ipc-chip">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={ipcInput}
                  onChange={(e) => setIpcInput(e.target.value)}
                  onKeyDown={handleIpcKeyDown}
                  onBlur={() => ipcInput.trim() && addTag(ipcInput)}
                  placeholder={ipcTags.length === 0 ? 'Type section number and press Enter…' : ''}
                />
              </div>
              <p className="hint">Press Enter or comma after each section — e.g. 302, 307, 420</p>
            </div>

            {/* Crime Description */}
            <div className="mt-4">
              <Label required>Crime Description</Label>
              <textarea
                name="crime_description"
                value={form.crime_description}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed factual matrix of the alleged offense, chronology of events, location, and any aggravating circumstances…"
                className="form-control"
              />
            </div>
          </Section>

          {/* ACCUSED */}
          <Section title="Accused Details">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Label>Full Name</Label>
                <input name="accused_name" type="text" value={form.accused_name} onChange={handleChange} placeholder="Full legal name" className="form-control" />
              </div>
              <div>
                <Label>Age</Label>
                <input name="age" type="number" min={1} max={120} value={form.age} onChange={handleChange} placeholder="e.g. 34" className="form-control" />
              </div>
              <div>
                <Label>Gender</Label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Criminal Background</Label>
                <textarea
                  name="accused_background"
                  value={form.accused_background}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Prior convictions, socio-economic status, community ties, family background…"
                  className="form-control"
                />
              </div>
              <div>
                <Label>Evidence Summary</Label>
                <textarea
                  name="evidence_summary"
                  value={form.evidence_summary}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Direct evidence, forensic recovery, witness statements, CCTV…"
                  className="form-control"
                />
              </div>
            </div>
          </Section>

          {/* RISK PROFILE */}
          <Section title="Risk Profile">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label required>Severity Rating</Label>
                <select name="severity" value={form.severity} onChange={handleChange} className="form-control">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <Label required>Evidence Strength</Label>
                <select name="evidence_strength" value={form.evidence_strength} onChange={handleChange} className="form-control">
                  <option>Weak</option>
                  <option>Moderate</option>
                  <option>Strong</option>
                </select>
              </div>
              <div>
                <Label required>Flight Risk</Label>
                <select name="flight_risk" value={form.flight_risk} onChange={handleChange} className="form-control">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-1">
            <button type="submit" id="analyze-case-button" disabled={loading} className="btn-primary">
              {loading ? <><Spinner />Analyzing Case…</> : <>⚖️ Analyze Case</>}
            </button>
            <p className="text-xs text-ink-faint flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
              </svg>
              All data processed securely by the BERT prediction engine
            </p>
          </div>
        </div>

        {/* ── Right: Info panel ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* ① Recent Analyses — REAL localStorage data, at top to align with Case Info */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-ink uppercase tracking-widest">
                Recent Analyses
              </p>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-2xs text-ink-faint hover:text-rejected transition-colors font-medium"
                  title="Clear history"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <svg className="w-7 h-7 text-ink-faint mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                <p className="text-xs text-ink-faint font-medium">No analyses yet</p>
                <p className="text-2xs text-ink-faint mt-0.5">Predictions will appear here after you analyze a case</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {history.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 group">
                    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.granted ? 'bg-granted' : 'bg-rejected'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink truncate">{item.ref}</p>
                      {item.accusedName && item.accusedName !== 'Unknown' && (
                        <p className="text-2xs text-ink-faint truncate">{item.accusedName}</p>
                      )}
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-2xs font-semibold ${item.granted ? 'text-granted' : 'text-rejected'}`}>
                          {item.decision}
                        </p>
                        <p className="text-2xs text-ink-faint tabular-nums">
                          {item.confidence.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-2xs text-ink-faint mt-0.5">{item.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ② Analysis Tip */}
          <div className="rounded-lg bg-brand p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">i</span>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Analysis Tip</p>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              Detailed evidence summaries significantly improve the precision of the flight-risk score.
              Ensure all IPC sections are mapped correctly to the FIR details.
            </p>
          </div>

          {/* ③ Disclaimer */}
          <p className="text-2xs text-ink-faint leading-relaxed px-1">
            AI Confidence Disclaimer: Recommendations are based on historical data.
            Final judicial discretion remains with the presiding officer.
          </p>
        </div>

      </div>
    </form>
  )
}
