'use client'

import { useEffect, useState } from 'react'

interface HabitData {
  id: string; name: string; icon: string; color: string
  completedToday: boolean; streak: number; completionRate: number
  logs: Array<{ date: string; completed: boolean }>
}

type Tab = 'today' | 'calendar' | 'stats'

export default function StridePage() {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [tab, setTab] = useState<Tab>('today')
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/habits').then(r => r.json()).then(d => { setHabits(d.habits || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().split('T')[0]

  const toggle = async (habitId: string) => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, date: today }),
    })
    load()
  }

  const completedCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length
  const overallRate = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0

  const calendarDays: Array<{ date: string; count: number }> = []
  for (let i = 41; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const count = habits.filter(h => h.logs.some(l => l.date === ds && l.completed)).length
    calendarDays.push({ date: ds, count })
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #6D4AFF, #8B5CF6)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Stride</h1>
            <p className="text-xs text-[#6B6B8D]">{greeting}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-24">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-[#6B6B8D]">Loading...</div>
        ) : tab === 'today' ? (
          <>
            {/* Progress ring */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#1E1E36" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" stroke="#6D4AFF" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${overallRate * 3.27} 327`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{completedCount}/{totalCount}</span>
                  <span className="text-[10px] text-[#6B6B8D]">completed</span>
                </div>
              </div>
              <p className="text-sm text-[#6B6B8D]">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Habit list */}
            <div className="space-y-3">
              {habits.map(h => (
                <button
                  key={h.id}
                  onClick={() => toggle(h.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${h.completedToday ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-[#1E1E36] bg-[#13131C]'}`}
                >
                  <div className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${h.completedToday ? 'bg-[#22C55E]/15' : 'bg-[#1A1A28]'}`}>
                    {h.completedToday ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> : h.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${h.completedToday ? 'text-[#22C55E]' : ''}`}>{h.name}</div>
                    <div className="text-xs text-[#6B6B8D]">{h.streak} day streak &middot; {h.completionRate}% rate</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg" style={{ color: h.color }}>{h.streak > 0 ? `${h.streak}🔥` : ''}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : tab === 'calendar' ? (
          <>
            <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Activity Heatmap</h2>
            <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-4">
              <div className="grid grid-cols-7 gap-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] text-[#6B6B8D]">{d}</div>
                ))}
                {calendarDays.map((d, i) => {
                  const intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 4 ? 2 : 3
                  const colors = ['#1A1A28', '#6D4AFF33', '#6D4AFF77', '#6D4AFF']
                  return (
                    <div
                      key={i}
                      title={`${d.date}: ${d.count}/${totalCount}`}
                      className="aspect-square rounded-md"
                      style={{ background: colors[intensity] }}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[#6B6B8D]">
                <span>Less</span>
                {['#1A1A28', '#6D4AFF33', '#6D4AFF77', '#6D4AFF'].map((c, i) => (
                  <div key={i} className="h-3 w-3 rounded-sm" style={{ background: c }} />
                ))}
                <span>More</span>
              </div>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-bold text-[#6B6B8D]">Habit Streaks</h3>
            <div className="space-y-2">
              {habits.map(h => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-[#1E1E36] bg-[#13131C] p-3">
                  <span className="text-lg">{h.icon}</span>
                  <span className="flex-1 text-sm">{h.name}</span>
                  <span className="text-sm font-bold" style={{ color: h.color }}>{h.streak}d</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-4 text-center">
                <div className="text-2xl font-bold text-[#6D4AFF]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{habits.reduce((s, h) => s + h.streak, 0)}</div>
                <div className="text-xs text-[#6B6B8D]">Total Streak Days</div>
              </div>
              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-4 text-center">
                <div className="text-2xl font-bold text-[#22C55E]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{Math.round(habits.reduce((s, h) => s + h.completionRate, 0) / (habits.length || 1))}%</div>
                <div className="text-xs text-[#6B6B8D]">Avg Completion</div>
              </div>
              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-4 text-center">
                <div className="text-2xl font-bold text-[#22D3EE]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{Math.max(...habits.map(h => h.streak))}</div>
                <div className="text-xs text-[#6B6B8D]">Best Streak</div>
              </div>
              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-4 text-center">
                <div className="text-2xl font-bold text-[#F59E0B]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{habits.length}</div>
                <div className="text-xs text-[#6B6B8D]">Active Habits</div>
              </div>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-bold text-[#6B6B8D]">Per Habit</h3>
            <div className="space-y-2">
              {habits.map(h => (
                <div key={h.id} className="rounded-xl border border-[#1E1E36] bg-[#13131C] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm"><span>{h.icon}</span>{h.name}</span>
                    <span className="text-xs font-bold" style={{ color: h.color }}>{h.completionRate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1A1A28]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${h.completionRate}%`, background: h.color }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-[#1E1E36] bg-[#0D0D14]/90 backdrop-blur-xl">
        <div className="flex">
          {([
            { key: 'today' as Tab, label: 'Today', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
            { key: 'calendar' as Tab, label: 'Calendar', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
            { key: 'stats' as Tab, label: 'Stats', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all ${tab === t.key ? 'text-[#A78BFA]' : 'text-[#6B6B8D]'}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
