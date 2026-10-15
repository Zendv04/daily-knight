import type { Task } from '../types'

type Props = {
  task: Task
    onDone: (id: number) => void
}

export default function TaskItem({ task, onDone }: Props) {
  return (
    <li>
      {task.title} - {task.status}{''}
      <button 
      onClick={() => onDone(task.id)}
      disabled={task.status != 'pending'}
      >
        Done
      </button>
    </li>
  )
}