import type { Task, TaskStatus } from '../types'

// Tunable game constants
export const RAGE_THRESHOLD = 0.3 // share of baseline tasks missed to trigger rage
export const FALL_THRESHOLD = 0.5 // share of baseline tasks missed to make the hero fall

export type HeroState = 'normal' | 'rage' | 'fallen'
export type BattleResult = 'ongoing' | 'victory' | 'defeat' | 'draw'

export interface GameStats {
  total: number
  baseline: number
  doneCount: number
  missedCount: number
  pendingCount: number
  rageAt: number
  fallAt: number
  enemyHp: number
  heroHp: number
  ragePercent: number
  heroState: HeroState
  finisher: boolean
  result: BattleResult
}

export function getStats(tasks: Task[]): GameStats {
  const total = tasks.length
  // Thresholds are based on tasks that existed before the first action,
  // so tasks added later cannot dilute the miss rate.
  const baseline = tasks.filter((t) => !t.late).length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const missedCount = tasks.filter((t) => t.status === 'missed').length
  const pendingCount = total - doneCount - missedCount

  const rageAt = Math.max(1, Math.ceil(baseline * RAGE_THRESHOLD))
  const fallAt = Math.max(1, Math.ceil(baseline * FALL_THRESHOLD))

  const heroHp = Math.max(0, 100 - (missedCount / fallAt) * 100)
  const ragePercent = Math.min(100, (missedCount / rageAt) * 100)

  let heroState: HeroState = 'normal'
  if (missedCount >= fallAt) heroState = 'fallen'
  else if (missedCount >= rageAt) heroState = 'rage'

  let result: BattleResult = 'ongoing'
  let finisher = false

  if (total > 0 && heroState === 'fallen') {
    result = 'defeat'
  } else if (total > 0 && pendingCount === 0) {
    if (heroState === 'rage') {
      result = 'victory'
      finisher = true
    } else if (missedCount === 0) {
      result = 'victory'
    } else {
      result = 'draw'
    }
  }

  const enemyHp = finisher ? 0 : total - doneCount

  return {
    total,
    baseline,
    doneCount,
    missedCount,
    pendingCount,
    rageAt,
    fallAt,
    enemyHp,
    heroHp,
    ragePercent,
    heroState,
    finisher,
    result,
  }
}

export function updateTaskStatus(
  tasks: Task[],
  id: number,
  status: TaskStatus,
): Task[] {
  if (getStats(tasks).result !== 'ongoing') return tasks // battle is over

  return tasks.map((task) =>
    task.id === id && task.status === 'pending' ? { ...task, status } : task,
  )
}

// Returns a new list with the task appended. A task added after the first
// action is marked late so it does not move the rage/fall thresholds.
// Pure function: the input list is never modified.
export function addTask(tasks: Task[], title: string): Task[] {
  if (getStats(tasks).result !== 'ongoing') return tasks // battle is over
  const late = tasks.some((t) => t.status !== 'pending')
  return [...tasks, { id: Date.now(), title, status: 'pending', late }]
}