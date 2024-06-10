import { Label } from "./label.interface"

export interface SyncLabels {
  full_sync: boolean
  labels: [Label]
  sync_token: string
}