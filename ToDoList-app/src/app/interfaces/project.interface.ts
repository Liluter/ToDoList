export interface Project {
  color: string
  collapsed: boolean
  parent_id: string | null
  is_deleted: boolean
  id: string
  user_id: string
  name: string
  child_order: number
  is_archived: boolean
  view_style: string
}