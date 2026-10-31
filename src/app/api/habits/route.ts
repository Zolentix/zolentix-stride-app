import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const user = await prisma.user.findFirst()
  if (!user) return NextResponse.json({ habits: [] })

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: { logs: { orderBy: { date: 'desc' } } },
  })

  const today = new Date().toISOString().split('T')[0]

  const result = habits.map(h => {
    const todayLog = h.logs.find(l => l.date === today)
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split('T')[0]
      if (h.logs.some(l => l.date === ds && l.completed)) streak++
      else break
      d.setDate(d.getDate() - 1)
    }
    const last30 = h.logs.filter(l => {
      const ld = new Date(l.date + 'T12:00:00')
      const diff = (new Date().getTime() - ld.getTime()) / 86400000
      return diff <= 30 && l.completed
    }).length
    return {
      id: h.id, name: h.name, icon: h.icon, color: h.color,
      completedToday: !!todayLog, streak, completionRate: Math.round(last30 / 30 * 100),
      logs: h.logs.slice(0, 42).map(l => ({ date: l.date, completed: l.completed })),
    }
  })

  return NextResponse.json({ habits: result, userId: user.id })
}

export async function POST(req: NextRequest) {
  const { habitId, date } = await req.json()
  if (!habitId || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const existing = await prisma.habitLog.findUnique({ where: { habitId_date: { habitId, date } } })
  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } })
    return NextResponse.json({ toggled: false })
  }
  await prisma.habitLog.create({ data: { habitId, date, completed: true } })
  return NextResponse.json({ toggled: true })
}
