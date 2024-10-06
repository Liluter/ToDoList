import { Component, computed, DestroyRef, inject, OnInit, signal, Signal, WritableSignal } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, KeyValuePipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { combineLatest, map, Observable, startWith, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { Item } from "@angular/fire/analytics";
import { ItemCompleted } from "../../../interfaces/item-completed.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { TaskStatus, ShowModalService } from "../../../services/showModal.service";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message, MessageStatus } from "../../../types/message.interface";
import { FormsModule } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { FilterModel } from "../../../types/filter.interface";
import { SortBy, SortDir } from "../../../types/sortBy";
@Component({
  templateUrl: './all-page.component.html',
  standalone: true,
  styleUrl: './all-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, KeyValuePipe, FormsModule]
})
export class AllPageComponent implements OnInit {
  taskStatus = TaskStatus
  destroyRef = inject(DestroyRef)
  showModal: TasksType = { tasks: 'none' }
  uncompletedTasks$!: Observable<Tasks>;
  completedTasks$!: Observable<Tasks>;
  allTasks$!: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  api: ApiCallsService = inject(ApiCallsService)
  modalService = inject(ShowModalService)
  checkBoxElement$: Observable<HTMLInputElement | null> = this.modalService.checkBoxELement$
  target!: HTMLInputElement | null
  refreshTriger$ = this.api.refreshTrigger
  uncompletedTasks2$!: Observable<Tasks>
  tasks: boolean[] = []
  tasks2: boolean[] = []
  checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  loadingState: boolean = false
  showMessageService: ShowMessageService = inject(ShowMessageService)
  // modalShow$: Observable<boolean> = this.modalService.modalShow$
  modalShowSignal: Signal<boolean | undefined> = this.modalService.modalShowSignal
  modalDeleteShowSignal = this.modalService.modalDeleteShowSignal


  messageModal$: Observable<string> = this.modalService.message$
  modalDeleteShow$: Observable<boolean> = this.modalService.modalDeleteShow$
  taskStatusHandler$ = this.modalService.taskStatusHandler$
  taskStatusHandlerSignal = this.modalService.taskStatusHandlerSignal
  listSortBy = SortBy
  listSortDir = SortDir
  allLabels: Signal<Label[] | null> = toSignal(this.api.getAllLabels(), { initialValue: null })
  allProjects: Signal<[SyncProject] | null> = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
  checksBoolArray: Signal<boolean[] | undefined> = toSignal(this.modalService.checkArray$)
  checksBoolArray2: Signal<boolean[] | undefined> = toSignal(this.modalService.checkArray2$)


  checkBoxElementSignal: Signal<HTMLInputElement | null> = toSignal(this.modalService.checkBoxELement$, { initialValue: null })

  filterByTitle: WritableSignal<string> = signal('')
  filterByPriority: WritableSignal<string> = signal('')
  filterByLabel: WritableSignal<string> = signal('')
  filterByProject: WritableSignal<string> = signal('')

  filters: FilterModel[] = [{ filter: this.filterByTitle, name: 'title' },
  // { filter: this.filterByPriority, name: 'priority' },
  // { filter: this.filterByLabel, name: 'label' },
  { filter: this.filterByProject, name: 'project' }]
  tasksModeluncompleted: boolean[] | undefined = this.checksBoolArray()
  tasksModelcompleted: boolean[] | undefined = this.checksBoolArray2()
  sortBy: WritableSignal<SortBy> = signal(SortBy.date)
  sortDir: WritableSignal<SortDir> = signal(SortDir.asc)

  uncompletedTasks: Signal<Tasks | undefined> = toSignal(this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
    tap(data => {
      this.tasksModeluncompleted = data.items.map(() => false)
      this.modalService.initCheckArray(this.tasksModeluncompleted)
    }),
    map(data => { return { uncompleted: data.items, completed: null } }),
  ))))
  completedTasks: Signal<Tasks | undefined> = toSignal(this.refreshTriger$.pipe(switchMap(() => this.api.getCompletedTasks().pipe(
    tap(data => {
      this.tasksModelcompleted = data.items.map(item => true)
      this.modalService.initCheckArray2(this.tasksModelcompleted)
    }),
    map(data => { return { uncompleted: null, completed: data.items } }),
  ))))
  sortedTasks: Signal<Tasks | undefined> = computed(() => {
    let tasks: Tasks = {
      uncompleted: this.uncompletedTasks()?.uncompleted,
      completed: this.completedTasks()?.completed
    }
    if (this.filterByTitle().length > 0) {
      tasks.completed = tasks.completed?.filter(item => item.content.toLowerCase().includes(this.filterByTitle().trim().toLowerCase()))
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.content.toLowerCase().includes(this.filterByTitle().trim().toLowerCase()))

    }
    // if (this.filterByPriority().length === 1) {
    //   tasks.completed = tasks.completed?.filter(item => item.priority === +this.filterByPriority())
    // }
    // if (this.filterByLabel().length > 0) {
    //   tasks.completed = tasks.completed?.filter(item => item.labels.some(el => el.toLowerCase().includes(this.filterByLabel().trim().toLowerCase())))
    // }
    if (this.filterByProject().length > 0) {
      tasks.completed = tasks.completed?.filter(item => this.projectNameById(item.project_id)?.toLowerCase().includes(this.filterByProject().trim().toLowerCase()))
      tasks.uncompleted = tasks.uncompleted?.filter(item => this.projectNameById(item.project_id)?.toLowerCase().includes(this.filterByProject().trim().toLowerCase()))

    }

    switch (this.sortBy()) {
      // case SortBy.priority:
      //   return this.sortDir() === SortDir.asc ? {
      //     uncompleted: tasks.uncompleted?.sort((a, b) => a.priority - b.priority), completed: tasks?.completed
      //   } : {
      //     uncompleted: tasks.uncompleted?.sort((a, b) => b.priority - a.priority), completed: tasks?.completed
      //   }
      case SortBy.date:
        return this.sortDir() === SortDir.asc ? {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) { return Date.parse(prim.due.date) - Date.parse(sec.due.date) }
            else if (prim.due || sec.due) { return 1 }
            else return 0
          }
          ), completed: tasks.completed?.sort((prim, sec) => {
            if (prim.completed_at && sec.completed_at) return Date.parse(prim.completed_at) - Date.parse(sec.completed_at)
            else if (prim.completed_at || sec.completed_at) return 1
            else return 0
          }
          )
        } : {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) return Date.parse(sec.due.date) - Date.parse(prim.due.date)
            else if (prim.due || sec.due) { return 1 }
            else return 0
          }), completed: tasks.completed?.sort((prim, sec) => {
            if (prim.completed_at && sec.completed_at) return Date.parse(sec.completed_at) - Date.parse(prim.completed_at)
            else if (prim.completed_at || sec.completed_at) return 1
            else return 0
          })
        }
      default:
        return tasks
    }
  })

  ngOnInit(): void {
    // this.checkBoxElement$.subscribe(data => this.target = data)
    // this.allLabels$ = this.api.getAllLabels()
    // // this.uncompletedTasks$ = this.api.getUncompletedTasks().pipe(
    // //   map(data => { return { uncompleted: data.items, completed: null } }),
    // // )
    // this.uncompletedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
    //   tap(data => {
    //     this.tasks = data.items.map(item => false)
    //     this.modalService.initCheckArray(this.tasks)
    //   }),
    //   map(data => { return { uncompleted: data.items, completed: null } }),
    // )))
    // // this.uncompletedTasks2$ = combineLatest([this.refreshTriger$]).pipe(switchMap(() => this.uncompletedTasks$))
    // this.completedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getCompletedTasks().pipe(
    //   tap(data => {
    //     this.tasks2 = data.items.map(item => true)
    //     this.modalService.initCheckArray2(this.tasks2)
    //   }),
    //   map(data => { return { uncompleted: null, completed: data.items } }),

    // )))

    // this.allTasks$ = combineLatest([this.uncompletedTasks$, this.completedTasks$]).pipe(
    //   startWith([null, null]),
    //   map(([uncompletedTasks, completedTasks]) => {
    //     return { uncompleted: uncompletedTasks?.uncompleted, completed: completedTasks?.completed }
    //   })
    // )
    // this.checkArray$.subscribe(data => {
    //   this.tasks = data
    // })
    this.refreshData()
  }
  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  openModal(taskId: string, input: HTMLInputElement, status?: TaskStatus) {
    console.log(input.id, status)
    if (status === TaskStatus.complete) {
      const lastIndexOf = input.id.lastIndexOf('-')
      const idx = +input.id.slice(lastIndexOf + 1)
      console.log(idx, input, status)
      const newTasks2 = this.tasksModeluncompleted?.map((task, index) => index === idx ? true : false)
      if (input.checked && newTasks2) {
        this.modalService.nextCheck(newTasks2)
        this.modalService.showModal(taskId, input, status)
      } else {
        this.modalService.closeModal(idx, false, status)
      }
    } else if (status === TaskStatus.uncomplete) {
      const lastIndexOf = input.id.lastIndexOf('-')
      const idx = +input.id.slice(lastIndexOf + 1)
      console.log(idx, input, status)
      console.log(this.tasksModeluncompleted)
      const newTasks = this.tasksModelcompleted?.map((task, index) => index === idx ? false : true)
      if (!input.checked && newTasks) {
        this.modalService.nextCheck2(newTasks)
        this.modalService.showModal(taskId, input, status)
      } else {
        this.modalService.closeModal(idx, true, status)
      }
    }

  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }
  closeModal(status?: TaskStatus) {
    const checkBoxElement = this.checkBoxElementSignal()
    if (checkBoxElement !== null) {
      const lastIndexOf = checkBoxElement.id.lastIndexOf('-')
      const idx = +checkBoxElement.id.slice(lastIndexOf + 1)
      const check = status === TaskStatus.complete ? false : true
      this.modalService.closeModal(idx, check, status)
    }

  }
  closeDeleteModal() {
    this.modalService.closeDeleteModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.completeTask(taskId).pipe(tap(() => this.refreshData())).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  completed successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: MessageStatus.error, text: message })
      }
    );
    this.refreshData()
    // const lastIndexOf = this.target?.id.lastIndexOf('-')
    // const idx = +this.target!.id.slice(lastIndexOf + 1)
    // this.modalService.closeModal(idx, true)
    this.closeModal()
  }
  unCompleteTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.uncompleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  uncomplete successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: MessageStatus.error, text: message })
      }
    )
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, true)
  }
  refreshData() {
    this.refreshTriger$.next()
  }
  deleteTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.deleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  deleted successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: MessageStatus.error, text: message })
      }
    )
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  sortOption(sort: SortBy) {
    this.sortBy.set(sort)
  }
  sortDirection(sort: SortDir) {
    this.sortDir.set(sort)
  }
  projectNameById(id: string) {
    return this.allProjects()?.find(el => el.id === id)?.name
  }
  clearFilters() {
    this.filters.forEach(f => f.filter.set(''))
  }
}