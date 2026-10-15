import type { Task } from '../types'

type Props = {
  task: Task
}

export default function TaskItem({ task }: Props) {
  return (
    <li>
      {task.title} - {task.status}
    </li>
  )
}