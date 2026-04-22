import React from 'react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <span className="text-xl" role="img" aria-label="Scales">⚖️</span>
            <span className="text-base font-semibold text-ink tracking-tight">
              Bail Reckoner
            </span>
          </a>

          {/* Nav tabs */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {['Analyzer', 'Precedents', 'Reports'].map((tab, i) => (
              <a
                key={tab}
                href="#"
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors no-underline ${
                  i === 0
                    ? 'text-brand bg-brand-light font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-inset'
                }`}
              >
                {tab}
              </a>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-muted font-medium bg-inset px-2.5 py-1 rounded-full border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            LegalBERT · Live
          </span>
          <button className="w-8 h-8 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center" title="Account">
            JM
          </button>
        </div>

      </div>
    </header>
  )
}
