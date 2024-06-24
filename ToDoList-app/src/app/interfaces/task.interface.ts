export interface Task {
  content: string
  description: string
  due: {
    date: string
    string: string | "9 Jun"
  }
  labels: [string]
  priority: number
  project_id: string
}