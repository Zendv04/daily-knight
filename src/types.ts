export type TaskStatus = 'pending' | 'done' | 'missed'

export interface Task {
  id: number
  title: string
  status: TaskStatus
  late?: boolean // added after the first action of the day
}