import { useState } from 'react'
import TaskItem from './components/TaskItem'
import type { Task } from './types'

function App() {
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

  function markDone(id: number) {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, status: 'done' } : t))
    )
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div>
      <h1>Daily Knight</h1>
      <p>
        Hoàn thành: {doneCount}/{tasks.length}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thêm việc cần làm..."
      />
      <button onClick={addTask}>Thêm</button>

      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onDone={markDone} />
        ))}
      </ul>
    </div>
  )
}

export default App