import React from 'react'

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard' },
  { icon: '🔍', label: 'Case Search' },
  { icon: '⚖️', label: 'New Case Analysis', active: true },
  { icon: '📁', label: 'Case Records' },
  { icon: '🤖', label: 'AI Predictions' },
  { icon: '💬', label: 'Explanation Assistant' },
  { icon: '📊', label: 'Reports & Analytics' },
  { icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-surface-card border-r border-outline/30 min-h-screen">
      {/* User badge */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-outline/20">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
          MP
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-text-primary truncate">Magistrate Portal</p>
          <p className="text-[10px] text-text-hint truncate">Judicial District 04</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-colors duration-150 ${
              item.active
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-low hover:text-primary'
            }`}
          >
            <span className={`text-sm w-4 text-center ${item.active ? 'text-white' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-[12px] font-semibold truncate ${item.active ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  )
}
