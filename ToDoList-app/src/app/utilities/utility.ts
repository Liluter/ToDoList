import { Label } from "../interfaces/label.interface"
import { SyncProject } from "../interfaces/syncProject.interface"

export function badgeClass(priority: number | undefined) {
  switch (priority) {
    case 1:
      return 'text-bg-secondary'
    case 2:
      return 'text-bg-primary'
    case 3:
      return 'text-bg-warning'
    case 4:
      return 'text-bg-danger'
    default:
      return 'text-bg-secondary'
  }
}

export function priorityText(priority: number) {
  switch (priority) {
    case 1:
      return '4'
    case 2:
      return '3'
    case 3:
      return '2'
    case 4:
      return '1'
    default:
      return '4'
  }
}

export function getLabelColor(labelName: string, labels?: Label[]) {
  if (!labels) {
    return
  }
  return labels.find(label => label.name === labelName)?.color
}

export function getProjectColor(projectName: string, projects?: SyncProject[]) {
  if (!projects) {
    return
  }
  return projects.find(project => project.name === projectName)?.color
}