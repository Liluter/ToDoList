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