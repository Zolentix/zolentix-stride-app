import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: { name: 'Demo User', email: 'demo@stride.zolentix.com' },
  })

  const habits = await Promise.all([
    prisma.habit.create({ data: { name: 'Meditate', icon: '🧘', color: '#8B5CF6', userId: user.id } }),
    prisma.habit.create({ data: { name: 'Run 5K', icon: '🏃', color: '#22C55E', userId: user.id } }),
    prisma.habit.create({ data: { name: 'Read 30min', icon: '📚', color: '#22D3EE', userId: user.id } }),
    prisma.habit.create({ data: { name: 'Drink Water', icon: '💧', color: '#3B82F6', userId: user.id } }),
    prisma.habit.create({ data: { name: 'No Sugar', icon: '🚫', color: '#EF4444', userId: user.id } }),
    prisma.habit.create({ data: { name: 'Code Practice', icon: '💻', color: '#F59E0B', userId: user.id } }),
  ])

  let logCount = 0
  const today = new Date()
  for (let d = 42; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const dateStr = date.toISOString().split('T')[0]

    for (const h of habits) {
      const rate = 0.65 + Math.random() * 0.25
      if (Math.random() < rate) {
        await prisma.habitLog.create({
          data: { date: dateStr, completed: true, habitId: h.id },
        })
        logCount++
      }
    }
  }
  console.log(`Seeded: 1 user, ${habits.length} habits, ${logCount} logs`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
