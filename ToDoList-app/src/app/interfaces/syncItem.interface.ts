import { Item } from "./item.interface"

export interface SyncItem {
  full_sync: boolean
  items: [Item]
  sync_token: string
  temp_id_mapping: {}
}