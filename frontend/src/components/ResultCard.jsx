import React from 'react'

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

export default function ResultCard({ result, onReset }) {
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

          {/* Bar */}
          <ConfidenceBar pct={confidence} granted={granted} />

          {/* Detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-inset rounded-lg p-4">
              <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-2">
                Model Interpretation
              </p>
              <p className="text-sm text-ink-muted leading-relaxed">
                {granted
                  ? 'The BERT classifier finds no significant impediment to bail based on the current case parameters and historical precedents within Indian law.'
                  : 'The BERT classifier identifies elevated risk markers suggesting judicial custody is appropriate pending investigation and trial.'}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-rejected uppercase tracking-widest mb-2">
                ⚠ Legal Disclaimer
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                This is an AI-generated decision-support metric only. It does not constitute legal counsel or a binding judicial order.
                Final authority rests with the presiding magistrate.
              </p>
            </div>
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
