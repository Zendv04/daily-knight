import type { Task } from '../types'

type Props = {
  task: Task
  onDone: (id: number) => void
  onMissed: (id: number) => void
}

export default function TaskItem({ task, onDone, onMissed }: Props) {
  const isPending = task.status === 'pending'

  return (
    <li>
      {task.title} - {task.status}{' '}
      <button onClick={() => onDone(task.id)} disabled={!isPending}>
        Done
      </button>{' '}
      <button onClick={() => onMissed(task.id)} disabled={!isPending}>
        Missed
      </button>
    </li>
  )
}