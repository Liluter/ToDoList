import { ItemCompleted } from "./item-completed.interface";
import { Item } from "./item.interface";

export interface Tasks {
  uncompleted: Item[] | null | undefined
  completed: ItemCompleted[] | null | undefined
}