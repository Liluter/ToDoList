export interface SyncProject {
  can_assign_tasks: boolean
  child_order: number
  collapsed: boolean
  color: string
  created_at: string
  id: string
  inbox_project?: boolean
  is_archived: boolean
  is_deleted: boolean
  is_favorite: boolean
  name: string
  parent_id: string | null
  shared: boolean
  sync_id: string | null
  updated_at: string
  v2_id: string
  v2_parent_id: string | null
  view_style: string
}