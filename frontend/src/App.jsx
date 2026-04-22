import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import InputForm from './components/InputForm'
import ResultCard from './components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const HISTORY_KEY = 'br_recent_analyses'
const MAX_HISTORY = 10

// ── Persist helpers ────────────────────────────────────────────────────────────
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {
    // storage quota exceeded — skip silently
  }
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [history, setHistory] = useState(loadHistory)  // real localStorage history
  const resultRef = useRef(null)

  // Keep localStorage in sync whenever history changes
  useEffect(() => {
    saveHistory(history)
  }, [history])

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data } = await axios.post(`${API_URL}/predict`, formData, { timeout: 60000 })
      setResult(data)

      // Build a history entry from the form data + prediction result
      const caseRef = formData.case_number?.trim()
        || `CRL/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`

      const entry = {
        id:         Date.now(),
        ref:        caseRef,
        accusedName: formData.accused_name || 'Unknown',
        ipc:        formData.ipc_sections  || '—',
        decision:   data.decision,
        confidence: data.confidence,
        granted:    data.decision === 'Bail Granted',
        timestamp:  new Date().toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }),
      }

      // Prepend new entry; keep latest MAX_HISTORY
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY))

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out — the model may still be loading. Please wait a moment and try again.')
      } else if (err.response) {
        setError(`Server error (${err.response.status}): ${err.response.data?.detail || 'Unknown error'}`)
      } else {
        setError('Cannot reach the server. Please ensure the backend is running on port 8000.')
      }
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <InputForm
          onSubmit={handleSubmit}
          loading={loading}
          history={history}
          onClearHistory={clearHistory}
        />

        {/* Error banner */}
        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-rejected-bg border border-rejected-border rounded-lg animate-fade-up">
            <svg className="w-4 h-4 text-rejected shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rejected">Request Failed</p>
              <p className="text-sm text-ink-muted mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} aria-label="Dismiss" className="text-ink-faint hover:text-ink-muted transition-colors text-lg leading-none">×</button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef}>
            <ResultCard result={result} />
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-white mt-auto">
        {/* Links + copyright */}
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            {['Legal Terms', 'Privacy Policy', 'Contact Support'].map((link) => (
              <a key={link} href="#" className="text-xs text-ink-faint hover:text-ink-muted transition-colors font-medium no-underline">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-ink-faint text-center">
            Built for Smart India Hackathon · Bail Reckoner © 2025
          </p>
        </div>

        {/* AI disclaimer — pinned at the very bottom */}
        <div className="border-t border-border bg-inset py-2.5 px-6">
          <p className="text-center text-2xs text-ink-faint max-w-3xl mx-auto">
            <span className="font-semibold text-ink-muted">AI Confidence Disclaimer:</span>{' '}
            Recommendations are based on historical data. Final judicial discretion remains with the presiding officer.
          </p>
        </div>
      </footer>
    </div>
  )
}
