export interface Task {
  content: string
  description: string
  due_date: string
  due_string: string | "9 Jun"
  labels: any[]
  priority: number
  project_id: string
}