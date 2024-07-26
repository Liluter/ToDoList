// export type Modals = 'addTask' | 'listOfTasks' | 'addProject' | 'listOfProjects' | 'addLabel' | 'listOfLabels' | 'none' | 'completed' | 'uncompleted' | 'all'
export type Modals = { page: Page, subpage?: Subpage }
export type Page = 'addTask' | 'listOfTasks' | 'addProject' | 'listOfProjects' | 'addLabel' | 'listOfLabels' | 'none'
export type Subpage = 'completed' | 'uncompleted' | 'all' | 'none'

export type TasksType = { tasks: SubTasks };

export type SubTasks = 'completed' | 'uncompleted' | 'all' | 'none'

export type AddType = { add: SubAdd };

export type SubAdd = 'addTask' | 'addProject' | 'addLabel' | 'none'