import TaskItem from './components/TaskItem'
import type { Task } from './types'

const tasks: Task[] = [
  { id: 1, title: 'Học 30 phút', status: 'pending' },
  { id: 2, title: 'Dọn phòng', status: 'pending' },
  { id: 3, title: 'Tập thể dục', status: 'done' },
]

function App() {
  return (
    <div>
      <h1>Daily Knight</h1>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  )
}

export default App