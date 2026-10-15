import { useState } from 'react'
import HealthBar from './components/HealthBar'
import TaskItem from './components/TaskItem'
import { addTask, getStats, updateTaskStatus } from './game/rules'
import type { Task, TaskStatus } from './types'
import './App.css'

function App() {
  // Sample tasks stay in Vietnamese
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Học 30 phút', status: 'pending' },
    { id: 2, title: 'Dọn phòng', status: 'pending' },
    { id: 3, title: 'Tập thể dục', status: 'pending' },
    { id: 4, title: 'Đọc sách', status: 'pending' },
    { id: 5, title: 'Trả lời email', status: 'pending' },
  ])
  const [title, setTitle] = useState('')

  // Everything below is derived from tasks, not stored as state
  const stats = getStats(tasks)
  const locked = stats.result !== 'ongoing'

  function handleAdd() {
    const text = title.trim()
    if (!text || locked) return
    setTasks(addTask(tasks, text))
    setTitle('')
  }

  function setStatus(id: number, status: TaskStatus) {
    setTasks(updateTaskStatus(tasks, id, status))
  }

  function getMessage(): string {
    if (stats.result === 'defeat') return 'The hero has fallen.'
    if (stats.result === 'draw') return 'The day is over. The enemy survives.'
    if (stats.result === 'victory') {
      return stats.finisher
        ? 'FINISHER! The hero turns the tide!'
        : 'The enemy is defeated!'
    }
    if (stats.heroState === 'rage') {
      return `RAGE! Complete all ${stats.pendingCount} remaining task(s) to land the finisher.`
    }
    return 'Complete tasks to attack the enemy.'
  }

  return (
    <div className="app">
      <h1>Daily Knight</h1>

      <HealthBar
        label="Enemy"
        value={stats.enemyHp}
        max={stats.total}
        color="#d6453d"
      />
      <HealthBar label="Hero" value={stats.heroHp} max={100} color="#2e9e5b" />
      <HealthBar
        label="Rage"
        value={stats.ragePercent}
        max={100}
        color="#e8891c"
      />

      <p>{getMessage()}</p>

      <div className="add-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          disabled={locked}
        />
        <button onClick={handleAdd} disabled={locked}>
          Add
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            locked={locked}
            onDone={(id) => setStatus(id, 'done')}
            onMissed={(id) => setStatus(id, 'missed')}
          />
        ))}
      </ul>
    </div>
  )
}

export default App