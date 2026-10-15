import { useState } from 'react'
import HealthBar from './components/HealthBar'
import TaskItem from './components/TaskItem'
import type { Task, TaskStatus } from './types'
import './App.css'

const FALL_THRESHOLD = 0.5 // hero falls when 50% of tasks are missed

function App() {
  // Sample tasks stay in Vietnamese
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Học 30 phút', status: 'pending' },
    { id: 2, title: 'Dọn phòng', status: 'pending' },
    { id: 3, title: 'Tập thể dục', status: 'pending' },
  ])
  const [title, setTitle] = useState('')

  function addTask() {
    const text = title.trim()
    if (!text) return
    setTasks([...tasks, { id: Date.now(), title: text, status: 'pending' }])
    setTitle('')
  }

  function setStatus(id: number, status: TaskStatus) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  // Derived values: calculated from tasks, not stored as state
  const total = tasks.length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const missedCount = tasks.filter((t) => t.status === 'missed').length

  const enemyHp = total - doneCount
  const missRate = total > 0 ? missedCount / total : 0
  const heroHp = Math.max(0, 100 - (missRate / FALL_THRESHOLD) * 100)

  return (
    <div className="app">
      <h1>Daily Knight</h1>

      <HealthBar label="Enemy" value={enemyHp} max={total} color="#d6453d" />
      <HealthBar label="Hero" value={heroHp} max={100} color="#2e9e5b" />

      {heroHp === 0 && <p>The hero has fallen.</p>}
      {total > 0 && enemyHp === 0 && <p>The enemy is defeated!</p>}

      <div className="add-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDone={(id) => setStatus(id, 'done')}
            onMissed={(id) => setStatus(id, 'missed')}
          />
        ))}
      </ul>
    </div>
  )
}

export default App