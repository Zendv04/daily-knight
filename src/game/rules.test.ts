import { describe, expect, it } from 'vitest'
import { addTask, getStats, updateTaskStatus } from './rules'
import type { Task, TaskStatus } from '../types'

// Helper: build a task list from a list of statuses
function makeTasks(statuses: TaskStatus[]): Task[] {
  return statuses.map((status, i) => ({
    id: i + 1,
    title: `task ${i + 1}`,
    status,
  }))
}

describe('getStats', () => {
  it('handles an empty list without crashing', () => {
    const stats = getStats([])
    expect(stats.result).toBe('ongoing')
    expect(stats.heroState).toBe('normal')
    expect(stats.enemyHp).toBe(0)
  })

  it('starts a fresh day as ongoing with a healthy hero', () => {
    const stats = getStats(makeTasks(['pending', 'pending', 'pending']))
    expect(stats.result).toBe('ongoing')
    expect(stats.heroState).toBe('normal')
    expect(stats.heroHp).toBe(100)
    expect(stats.enemyHp).toBe(3)
  })

  it('stays normal below the rage threshold', () => {
    const stats = getStats(
      makeTasks(['missed', 'pending', 'pending', 'pending', 'pending']),
    )
    expect(stats.heroState).toBe('normal')
    expect(stats.ragePercent).toBe(50)
  })

  it('enters rage at 2 of 5 missed', () => {
    const stats = getStats(
      makeTasks(['missed', 'missed', 'pending', 'pending', 'pending']),
    )
    expect(stats.rageAt).toBe(2)
    expect(stats.heroState).toBe('rage')
    expect(stats.ragePercent).toBe(100)
    expect(stats.result).toBe('ongoing')
  })

  it('makes the hero fall at 3 of 5 missed', () => {
    const stats = getStats(
      makeTasks(['missed', 'missed', 'missed', 'pending', 'pending']),
    )
    expect(stats.fallAt).toBe(3)
    expect(stats.heroState).toBe('fallen')
    expect(stats.heroHp).toBe(0)
    expect(stats.result).toBe('defeat')
  })

  it('wins normally when every task is done', () => {
    const stats = getStats(makeTasks(['done', 'done', 'done']))
    expect(stats.result).toBe('victory')
    expect(stats.finisher).toBe(false)
    expect(stats.enemyHp).toBe(0)
  })

  it('lands the finisher when all remaining tasks are done during rage', () => {
    const stats = getStats(
      makeTasks(['missed', 'missed', 'done', 'done', 'done']),
    )
    expect(stats.result).toBe('victory')
    expect(stats.finisher).toBe(true)
    expect(stats.enemyHp).toBe(0)
  })

  it('does not land the finisher while tasks are still pending', () => {
    const stats = getStats(
      makeTasks(['missed', 'missed', 'done', 'done', 'pending']),
    )
    expect(stats.result).toBe('ongoing')
    expect(stats.finisher).toBe(false)
    expect(stats.enemyHp).toBe(3)
  })

  it('ends in a draw when the day is over with a few misses and no rage', () => {
    const stats = getStats(
      makeTasks(['missed', 'done', 'done', 'done', 'done']),
    )
    expect(stats.result).toBe('draw')
    expect(stats.enemyHp).toBe(1)
  })

  it('computes thresholds correctly for every baseline from 1 to 100', () => {
    for (let n = 1; n <= 100; n++) {
      const tasks = makeTasks(Array<TaskStatus>(n).fill('pending'))
      const stats = getStats(tasks)
      // Integer math is the reference, so floating-point errors show up here
      expect(stats.rageAt).toBe(Math.max(1, Math.ceil((n * 3) / 10)))
      expect(stats.fallAt).toBe(Math.max(1, Math.ceil(n / 2)))
    }
  })
})

describe('updateTaskStatus', () => {
  it('updates only the chosen pending task', () => {
    const tasks = makeTasks(['pending', 'pending'])
    const next = updateTaskStatus(tasks, 1, 'done')
    expect(next[0].status).toBe('done')
    expect(next[1].status).toBe('pending')
  })

  it('does not mutate the original list', () => {
    const tasks = makeTasks(['pending', 'pending'])
    updateTaskStatus(tasks, 1, 'done')
    expect(tasks[0].status).toBe('pending')
  })

  it('ignores tasks that are no longer pending', () => {
    const tasks = makeTasks(['done', 'pending'])
    const next = updateTaskStatus(tasks, 1, 'missed')
    expect(next[0].status).toBe('done')
  })

  it('ignores all input once the battle is over', () => {
    const tasks = makeTasks(['missed', 'missed', 'missed', 'pending', 'pending'])
    const next = updateTaskStatus(tasks, 4, 'done')
    expect(next).toBe(tasks)
  })
})

describe('addTask', () => {
  it('does not mark tasks as late before the first action', () => {
    const next = addTask(makeTasks(['pending', 'pending']), 'new task')
    expect(next).toHaveLength(3)
    expect(next[2].late).toBe(false)
  })

  it('marks tasks as late after the first action', () => {
    const tasks = makeTasks(['done', 'pending'])
    const next = addTask(tasks, 'new task')
    expect(next[2].late).toBe(true)
  })

  it('does not move the thresholds when late tasks are added', () => {
    let tasks = makeTasks(['missed', 'pending', 'pending', 'pending', 'pending'])
    for (let i = 0; i < 5; i++) tasks = addTask(tasks, `late ${i}`)

    let stats = getStats(tasks)
    expect(stats.total).toBe(10)
    expect(stats.baseline).toBe(5)
    expect(stats.heroState).toBe('normal')

    // One more miss still triggers rage, even though total is now 10
    tasks = updateTaskStatus(tasks, 2, 'missed')
    stats = getStats(tasks)
    expect(stats.heroState).toBe('rage')
  })

 it('requires late tasks to be finished before the finisher lands', () => {
  // baseline 5: rage at 2 missed, fall at 3 missed
  let tasks = makeTasks(['missed', 'missed', 'pending', 'pending', 'pending'])
  tasks = addTask(tasks, 'late task')
  const lateId = tasks[5].id

  // Finish every baseline task: the late task is still pending
  tasks = updateTaskStatus(tasks, 3, 'done')
  tasks = updateTaskStatus(tasks, 4, 'done')
  tasks = updateTaskStatus(tasks, 5, 'done')
  expect(getStats(tasks).heroState).toBe('rage')
  expect(getStats(tasks).result).toBe('ongoing')
  expect(getStats(tasks).finisher).toBe(false)

  // Finishing the late task lands the finisher
  tasks = updateTaskStatus(tasks, lateId, 'done')
  const stats = getStats(tasks)
  expect(stats.result).toBe('victory')
  expect(stats.finisher).toBe(true)
  expect(stats.enemyHp).toBe(0)
})

  it('refuses new tasks once the battle is over', () => {
    const tasks = makeTasks(['done', 'done'])
    expect(addTask(tasks, 'too late')).toBe(tasks)
  })
})