import type { Task } from '../types'

type Props = {
  task: Task
  locked: boolean
  onDone: (id: number) => void
  onMissed: (id: number) => void
}

export default function TaskItem({ task, locked, onDone, onMissed }: Props) {
  const canAct = task.status === 'pending' && !locked

  return (
    <li>
      {task.title} - {task.status}{' '}
      <button onClick={() => onDone(task.id)} disabled={!canAct}>
        Done
      </button>{' '}
      <button onClick={() => onMissed(task.id)} disabled={!canAct}>
        Missed
      </button>
    </li>
  )
}