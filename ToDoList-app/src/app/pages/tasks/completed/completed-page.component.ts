import { Component, computed, DestroyRef, inject, OnInit, signal, Signal, WritableSignal } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, KeyValuePipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor, getProjectColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
import { Message, MessageStatus } from "../../../types/message.interface";
import { ShowMessageService } from "../../../services/showMessage.service";
import { SortBy, SortDir } from "../../../types/sortBy";
import { toSignal } from "@angular/core/rxjs-interop";
import { FilterModel } from "../../../types/filter.interface";
@Component({
  templateUrl: './completed-page.component.html',
  standalone: true,
  styleUrl: './completed-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, KeyValuePipe, FormsModule]
})
export class CompletedPageComponent implements OnInit {
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  getProjectColor = getProjectColor
  modalService = inject(ShowModalService)
  api: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  refreshTriger$ = this.api.refreshTrigger
  modalShowSignal: Signal<boolean | undefined> = this.modalService.modalShowSignal
  modalDeleteShowSignal = this.modalService.modalDeleteShowSignal
  messageModalSignal = this.modalService.messageSignal
  checkBoxElementSignal: Signal<HTMLInputElement | null> = toSignal(this.modalService.checkBoxELement$, { initialValue: null })
  loadingState: boolean = false

  listSortBy = SortBy
  listSortDir = SortDir
  allLabels: Signal<Label[] | null> = toSignal(this.api.getAllLabels(), { initialValue: null })
  allProjects: Signal<[SyncProject] | null> = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
  checksBoolArray: Signal<boolean[] | undefined> = toSignal(this.modalService.checkArray$)
  tasksModel: boolean[] | undefined = this.checksBoolArray()
  sortBy: WritableSignal<SortBy> = signal(SortBy.date)
  sortDir: WritableSignal<SortDir> = signal(SortDir.asc)
  completedTasks: Signal<Tasks | undefined> = toSignal(this.refreshTriger$.pipe(switchMap(() => this.api.getCompletedTasks().pipe(
    tap(data => {
      this.tasksModel = data.items.map(item => true)
      this.modalService.initCheckArray(this.tasksModel)
    }),
    map(data => { return { uncompleted: null, completed: data.items } }),
  ))))

  filterByTitle: WritableSignal<string> = signal('')
  filterByPriority: WritableSignal<string> = signal('')
  filterByLabel: WritableSignal<string> = signal('')
  filterByProject: WritableSignal<string> = signal('')

  filters: FilterModel[] = [{ filter: this.filterByTitle, name: 'title' },
  // { filter: this.filterByPriority, name: 'priority' },
  // { filter: this.filterByLabel, name: 'label' },
  { filter: this.filterByProject, name: 'project' }]

  sortedTasks: Signal<Tasks | undefined> = computed(() => {
    let tasks: Tasks = {
      uncompleted: this.completedTasks()?.uncompleted,
      completed: this.completedTasks()?.completed
    }
    if (this.filterByTitle().length > 0) {
      tasks.completed = tasks.completed?.filter(item => item.content.toLowerCase().includes(this.filterByTitle().trim().toLowerCase()))
    }
    // if (this.filterByPriority().length === 1) {
    //   tasks.completed = tasks.completed?.filter(item => item.priority === +this.filterByPriority())
    // }
    // if (this.filterByLabel().length > 0) {
    //   tasks.completed = tasks.completed?.filter(item => item.labels.some(el => el.toLowerCase().includes(this.filterByLabel().trim().toLowerCase())))
    // }
    if (this.filterByProject().length > 0) {
      tasks.completed = tasks.completed?.filter(item => this.projectNameById(item.project_id)?.toLowerCase().includes(this.filterByProject().trim().toLowerCase()))
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
          uncompleted: tasks?.uncompleted, completed: tasks.completed?.sort((prim, sec) => {
            if (prim.completed_at && sec.completed_at) return Date.parse(prim.completed_at) - Date.parse(sec.completed_at)
            else return 1
          }
          )
        } : {
          uncompleted: tasks?.uncompleted, completed: tasks.completed?.sort((prim, sec) => {
            if (prim.completed_at && sec.completed_at) return Date.parse(sec.completed_at) - Date.parse(prim.completed_at)
            else return 1
          })
        }
      default:
        return tasks
    }
  })

  ngOnInit() {
    this.refreshData()
  }

  openModal(taskId: string, input: HTMLInputElement) {
    const lastIndexOf = input.id.lastIndexOf('-')
    const idx = +input.id.slice(lastIndexOf + 1)
    const newTasks = this.tasksModel?.map((task, index) => index === idx ? false : true)
    if (!input.checked && newTasks) {
      this.modalService.nextCheck(newTasks)
      this.modalService.showModal(taskId, input)
    } else {
      this.modalService.closeModal(idx, true)
    }
  }
  closeModal() {
    const checkBoxElement = this.checkBoxElementSignal()
    if (checkBoxElement !== null) {
      const lastIndexOf = checkBoxElement.id.lastIndexOf('-')
      const idx = +checkBoxElement.id.slice(lastIndexOf + 1)
      this.modalService.closeModal(idx, true)
    }
  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }
  closeDeleteModal() {
    this.modalService.closeDeleteModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    console.log('taks id : ', taskId)
    this.api.uncompleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  moved to uncompleted successfully` })
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
    this.closeModal()
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