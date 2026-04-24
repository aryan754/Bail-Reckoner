import React from 'react'

// ── Skeleton loader ────────────────────────────────────────────────────────────
function ReasoningSkeleton() {
  return (
    <div className="space-y-2 animate-pulse" aria-label="Loading reasoning…">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-11/12" />
      <div className="h-3 bg-gray-200 rounded w-10/12" />
      <div className="h-3 bg-gray-200 rounded w-full mt-3" />
      <div className="h-3 bg-gray-200 rounded w-9/12" />
      <div className="h-3 bg-gray-200 rounded w-11/12" />
      <div className="h-3 bg-gray-200 rounded w-full mt-3" />
      <div className="h-3 bg-gray-200 rounded w-10/12" />
    </div>
  )
}

// ── Confidence bar ─────────────────────────────────────────────────────────────
function ConfidenceBar({ pct, granted }) {
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setTimeout(() => setWidth(pct), 60))
    return () => cancelAnimationFrame(t)
  }, [pct])

  return (
    <div>
      <div className="w-full h-2 bg-inset rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: granted ? '#166534' : '#991B1B',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map((v) => (
          <span key={v} className="text-2xs text-ink-faint font-medium">{v}%</span>
        ))}
      </div>
    </div>
  )
}

// ── ResultCard ─────────────────────────────────────────────────────────────────
export default function ResultCard({ result, onReset, reasoning, reasoningLoading }) {
  const { decision, confidence, label } = result
  const granted = decision === 'Bail Granted'

  return (
    <div className="animate-fade-up mt-6">
      <div className="card overflow-hidden">

        {/* Colored top stripe */}
        <div className="h-1" style={{ backgroundColor: granted ? '#166534' : '#991B1B' }} />

        <div className="p-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-ink-muted font-medium uppercase tracking-widest mb-1">
                Prediction Verdict
              </p>
              <h2 className={`text-2xl font-semibold tracking-tight ${granted ? 'text-granted' : 'text-rejected'}`}>
                {decision}
              </h2>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                granted
                  ? 'bg-granted-bg text-granted border-granted-border'
                  : 'bg-rejected-bg text-rejected border-rejected-border'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${granted ? 'bg-granted' : 'bg-rejected'}`} />
                {granted ? 'Bail Eligible' : 'Bail Ineligible'}
              </span>
            </div>

            <div className="sm:text-right shrink-0">
              <p className="text-xs text-ink-muted font-medium uppercase tracking-widest mb-1">
                BERT Confidence
              </p>
              <p className="text-4xl font-semibold text-ink tabular-nums tracking-tight">
                {confidence.toFixed(1)}%
              </p>
              <p className="text-xs text-ink-faint mt-1 font-mono">{label}</p>
            </div>
          </div>

          {/* Confidence bar */}
          <ConfidenceBar pct={confidence} granted={granted} />

          {/* ── Groq AI Legal Reasoning ───────────────────────────────────────── */}
          <div className="mt-6 rounded-lg border border-border overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 bg-inset border-b border-border">
              <div className="flex items-center gap-2">
                {/* Scales-of-justice icon */}
                <svg
                  className="w-4 h-4 text-brand shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v18M3 9l9-6 9 6" />
                  <path d="M5 9l-2 6h4L5 9zm14 0l-2 6h4l-2-6z" />
                  <path d="M3 21h18" />
                </svg>
                <p className="text-xs font-semibold text-ink uppercase tracking-widest">
                  Legal Reasoning
                </p>
              </div>
              {/* Groq attribution badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-white border border-border text-ink-faint">
                <svg className="w-2.5 h-2.5 text-brand" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Powered by Groq AI
              </span>
            </div>

            {/* Reasoning body */}
            <div className="px-4 py-4">
              {reasoningLoading ? (
                <ReasoningSkeleton />
              ) : reasoning ? (
                <div className="space-y-3">
                  {reasoning.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-sm text-ink-muted leading-relaxed">
                      {para.trim()}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-faint italic">
                  Reasoning unavailable.
                </p>
              )}
            </div>
          </div>

          {/* Legal disclaimer */}
          <div className="mt-4 border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-rejected uppercase tracking-widest mb-2">
              ⚠ Legal Disclaimer
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              This is an AI-generated decision-support metric only. It does not constitute legal counsel or a binding judicial order.
              Final authority rests with the presiding magistrate.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
            <p className="text-xs text-ink-faint">
              Analysis complete · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-sm font-medium text-ink hover:bg-inset hover:border-brand/30 transition-all duration-150"
            >
              <svg className="w-4 h-4 text-brand" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              Analyze New Case
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
