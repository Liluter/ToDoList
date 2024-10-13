import { Label } from "../interfaces/label.interface"
import { Project } from "../interfaces/project.interface"
import { SimpleLabel } from "../interfaces/simpleLabel.interface"
import { Task } from "../interfaces/task.interface"

export const environment = {
  restApitoken: 'a06b19d79d9d93fe4467b74fa167b2872d29233a'
}

export const task: Task = {
  content: '',
  description: '',
  due_date: '',
  due_string: '',
  labels: [''],
  priority: 1,
  project_id: '2334294385'
}

export const project: Project = {
  color: 'charcoal',
  name: '',
  is_favorite: false,
}
export const defaultLabel: SimpleLabel = {
  color: 'charcoal',
  name: '',
  is_favorite: false,
}

export const colors = [
  {
    id: 30,
    name: 'berry_red',
    hexadecimal: '#b8256f'
  },
  {
    id: 31,
    name: 'red',
    hexadecimal: '#db4035'
  },
  {
    id: 32,
    name: 'orange',
    hexadecimal: '#ff9933'
  },
  {
    id: 33,
    name: 'yellow',
    hexadecimal: '#fad000'
  },
  {
    id: 34,
    name: 'olive_green',
    hexadecimal: '#afb83b'
  },
  {
    id: 35,
    name: 'lime_green',
    hexadecimal: '#7ecc49'
  },
  {
    id: 36,
    name: 'green',
    hexadecimal: '#299438'
  },
  {
    id: 30,
    name: 'berry_red',
    hexadecimal: '#b8256f'
  },
  {
    id: 37,
    name: 'mint_green',
    hexadecimal: '#6accbc'
  },
  {
    id: 38,
    name: 'teal',
    hexadecimal: '#158fad'
  },
  {
    id: 39,
    name: 'sky_blue',
    hexadecimal: '#14aaf5'
  },
  {
    id: 40,
    name: 'light_blue',
    hexadecimal: '#96c3eb'
  },
  {
    id: 42,
    name: 'grape',
    hexadecimal: '#884dff'
  },
  {
    id: 43,
    name: 'violet',
    hexadecimal: '#af38eb'
  },
  {
    id: 44,
    name: 'lavender',
    hexadecimal: '#eb96eb'
  },
  {
    id: 45,
    name: 'magenta',
    hexadecimal: '#e05194'
  },
  {
    id: 46,
    name: 'salmon',
    hexadecimal: '#ff8d85'
  },
  {
    id: 47,
    name: 'charcoal',
    hexadecimal: '#808080'
  },
  {
    id: 48,
    name: 'grey',
    hexadecimal: '#b8b8b8'
  },
  {
    id: 49,
    name: 'taupe',
    hexadecimal: '#ccac93'
  }
]