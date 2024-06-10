export interface Section {
  collapsed: boolean
  added_at: string
  archived_at: string | null
  id: string,
  is_archived: boolean
  is_deleted: boolean
  name: string
  project_id: string
  section_order: number
  sync_id: string | null
  user_id: string
}