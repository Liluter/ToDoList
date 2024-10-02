import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
import { Message } from "../../../types/message.interface";
import { ShowMessageService } from "../../../services/showMessage.service";
@Component({
  templateUrl: './completed-page.component.html',
  standalone: true,
  styleUrl: './completed-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule]
})
export class CompletedPageComponent implements OnInit {
  destroyRef = inject(DestroyRef)
  showModal: TasksType = { tasks: 'none' }
  completedTasks$!: Observable<Tasks>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  api: ApiCallsService = inject(ApiCallsService)
  modalService = inject(ShowModalService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  loadingState: boolean = false
  modalShow$: Observable<boolean> = this.modalService.modalShow$
  modalDeleteShow$: Observable<boolean> = this.modalService.modalDeleteShow$
  messageModal$: Observable<string> = this.modalService.message$
  checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  tasks: boolean[] = []
  target$: Observable<HTMLInputElement | null> = this.modalService.target$
  target!: HTMLInputElement | null
  refreshTriger$ = this.api.refreshTrigger$
  ngOnInit() {
    this.target$.subscribe(data => this.target = data)
    this.allLabels$ = this.api.getAllLabels()
    this.completedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getCompletedTasks().pipe(
      tap(data => {
        this.tasks = data.items.map(item => true)
        this.modalService.initCheckArray(this.tasks)
      }),
      map(data => { return { uncompleted: null, completed: data.items } }),
    )))
    this.checkArray$.subscribe(data => {
      this.tasks = data
    })
  }

  openModal(id: string, input: HTMLInputElement) {
    const lastIndexOf = input.id.lastIndexOf('-')
    const idx = +input.id.slice(lastIndexOf + 1)
    const newTasks = this.tasks.map((task, index) => index === idx ? false : true)
    if (!input.checked) {
      this.modalService.nextCheck(newTasks)
      this.modalService.showModal(id, input)
    } else {
      this.modalService.closeModal(idx, true)
    }
  }
  closeModal() {
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, true)
  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }
  closeDeleteModal() {
    this.modalService.closeDeleteModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.uncompleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: 'success', text: `Task "${taskId}"  moved to uncompleted successfully` })
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
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, false)
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
}