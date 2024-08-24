export interface EditData {
  id: string,
  content: string
  description: string,
  due: {
    date: string,
    is_recurring: boolean,
    lang: string,
    string: string,
    timezone: string | null
  }
  priority: 1 | 2 | 3 | 4
  labels: string[] | boolean[],
}