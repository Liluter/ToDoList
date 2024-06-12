import { SyncProject } from "./syncProject.interface"

export interface SyncProjects {
  full_sync: boolean
  projects: [SyncProject]
  sync_token: string
  temp_id_mapping: {}
}