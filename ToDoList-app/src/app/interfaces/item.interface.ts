export interface Item {
  added_at: string
  added_by_uid: string
  assigned_by_uid: string | null
  checked: boolean
  child_order: number
  collapsed: boolean
  completed_at: string | null
  content: string
  day_order: number
  description: string
  due: {
    date: string
    is_recurring: boolean
    lang: string | "en"
    string: string | "9 Jun"
    timezone: string | null
  }
  duration: number | string | null
  id: string
  is_deleted: boolean
  labels: [string]
  parent_id: string | number | null
  priority: number
  project_id: string
  responsible_uid: string | null
  section_id: string | null
  sync_id: string | null
  updated_at: string | null
  user_id: string | number
  v2_id: string | number
  v2_parent_id: string | number | null
  v2_project_id: string | number | null
  v2_section_id: string | number | null
}