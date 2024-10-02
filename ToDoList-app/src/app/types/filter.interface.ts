import { WritableSignal } from "@angular/core"

export interface FilterModel {
  filter: WritableSignal<string>
  name: string
}