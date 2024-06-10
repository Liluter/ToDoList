import { ItemCompleted } from "./item-completed.interface"
import { Project } from "./project.interface"
import { Section } from "./section.interface"
export interface AllCompleted {
  items: [ItemCompleted]
  projects: { [key: string]: Project }
  sections: { [key: string]: Section }
}