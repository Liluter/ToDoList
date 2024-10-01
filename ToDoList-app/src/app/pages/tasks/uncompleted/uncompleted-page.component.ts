import { Component, computed, inject, signal, Signal, WritableSignal } from "@angular/core";
import { AsyncPipe, DatePipe, JsonPipe, KeyValuePipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor, getProjectColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message } from "../../../types/message.interface";
import { SortBy, SortDir } from "../../../types/sortBy";
import { toSignal } from "@angular/core/rxjs-interop";
@Component({
  templateUrl: './uncompleted-page.component.html',
  standalone: true,
  styleUrl: './uncompleted-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule, KeyValuePipe, NgClass]
})
export class UncompletedPageComponent {

  // destroyRef = inject(DestroyRef)
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  getProjectColor = getProjectColor
  descriptionOpenHandler?: string;
  // labels?: Label[]
  // allLabels$?: Observable<Label[]>;
  // allProjects$?: Observable<[SyncProject]>;
  // menuObservable$: any;
  modalService = inject(ShowModalService)
  api: ApiCallsService = inject(ApiCallsService)
  // uncompletedTasks$!: Observable<Tasks>
  refreshTriger$ = this.api.refreshTrigger$
  // modalShow$: Observable<boolean> = this.modalService.modalShow$
  modalShowSignal: Signal<boolean | undefined> = this.modalService.modalShowSignal
  // modalDeleteShow$: Observable<boolean> = this.modalService.modalDeleteShow$
  modalDeleteShowSignal = this.modalService.modalDeleteShowSignal
  // messageModal$: Observable<string> = this.modalService.message$
  messageModalSignal = this.modalService.messageSignal
  // target$: Observable<HTMLInputElement | null> = this.modalService.target$
  // openModalBool: boolean = false
  checkBoxElementSignal = toSignal(this.modalService.target$)
  // checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  // refreshSubject = new Subject<void>()
  loadingState: boolean = false
  showMessageService: ShowMessageService = inject(ShowMessageService)

  allLabels: Signal<Label[] | undefined> = toSignal(this.api.getAllLabels())
  allProjects = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)))
  checksBoolArray: Signal<boolean[] | undefined> = toSignal(this.modalService.checkArray$)
  tasksModel: boolean[] | undefined = this.checksBoolArray()
  listSortBy = SortBy
  listSortDir = SortDir
  sortBy: WritableSignal<SortBy> = signal(SortBy.date)
  sortDir: WritableSignal<SortDir> = signal(SortDir.asc)
  uncompletedTasks: Signal<Tasks | undefined> = toSignal(this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
    tap(data => {
      this.tasksModel = data.items.map(item => false)
      this.modalService.initCheckArray(this.tasksModel)
    }),
    map(data => { return { uncompleted: data.items, completed: null } }),
  ))))

  filterByTitle: WritableSignal<string> = signal('')
  filterByPriority: WritableSignal<string> = signal('')
  filterByLabel: WritableSignal<string> = signal('')
  filterByProject: WritableSignal<string> = signal('')

  sortedTasks: Signal<Tasks | undefined> = computed(() => {
    let tasks: Tasks = {
      uncompleted: this.uncompletedTasks()?.uncompleted,
      completed: this.uncompletedTasks()?.completed
    }
    if (this.filterByTitle().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.content.includes(this.filterByTitle().trim()))
    }
    if (this.filterByPriority().length === 1) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.priority === +this.filterByPriority())
    }
    if (this.filterByLabel().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.labels.some(el => el.toLowerCase().includes(this.filterByLabel().trim().toLowerCase())))
    }
    if (this.filterByProject().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => this.projectNameById(item.project_id)?.toLowerCase().includes(this.filterByProject().trim().toLowerCase()))
    }

    console.log('tasks', tasks)
    switch (this.sortBy()) {
      case SortBy.priority:
        return this.sortDir() === SortDir.asc ? {
          uncompleted: tasks.uncompleted?.sort((a, b) => a.priority - b.priority), completed: tasks?.completed
        } : {
          uncompleted: tasks.uncompleted?.sort((a, b) => b.priority - a.priority), completed: tasks?.completed
        }
      case SortBy.date:
        return this.sortDir() === SortDir.asc ? {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) return Date.parse(prim.due!.date) - Date.parse(sec.due!.date)
            else return 1
          }
          ), completed: tasks?.completed
        } : {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) return Date.parse(sec.due!.date) - Date.parse(prim.due!.date)
            else return 1
          }), completed: tasks?.completed
        }
      default:
        return tasks
    }
  })




  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  openModal(id: string, input: HTMLInputElement) {
    const lastIndexOf = input.id.lastIndexOf('-')
    const idx = +input.id.slice(lastIndexOf + 1)
    const newTasks = this.tasksModel?.map((task, index) => index === idx ? true : false)
    if (input.checked && newTasks) {
      this.modalService.nextCheck(newTasks)
      this.modalService.showModal(id, input)
    } else {
      this.modalService.closeModal(idx, false)
    }
  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }

  closeModal() {
    const lastIndexOf = this.checkBoxElementSignal()!.id.lastIndexOf('-')
    const idx = +this.checkBoxElementSignal()!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, false)
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
          this.showMessage({ type: 'success', text: `Task "${taskId}"  completed successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: 'error', text: message })
      }
    );
    // this.refresh()
    const lastIndexOf = this.checkBoxElementSignal()!.id.lastIndexOf('-')
    const idx = +this.checkBoxElementSignal()!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, true)
  }
  refreshData() {
    this.refreshTriger$.next(null)
  }
  deleteTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.deleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: 'success', text: `Task "${taskId}"  deleted successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: 'error', text: message })
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
}