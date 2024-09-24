import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { combineLatest, map, Observable, Subject, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message } from "../../../types/message.interface";
@Component({
  templateUrl: './uncompleted-page.component.html',
  standalone: true,
  styleUrl: './uncompleted-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule]
})
export class UncompletedPageComponent implements OnInit {
  destroyRef = inject(DestroyRef)
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  tasks: boolean[] = []
  modalService = inject(ShowModalService)
  api: ApiCallsService = inject(ApiCallsService)
  uncompletedTasks$!: Observable<Tasks>
  refreshTriger$ = this.api.refreshTrigger$
  modalShow$: Observable<boolean> = this.modalService.modalShow$
  modalDeleteShow$: Observable<boolean> = this.modalService.modalDeleteShow$
  messageModal$: Observable<string> = this.modalService.message$
  target$: Observable<HTMLInputElement | null> = this.modalService.target$
  openModalBool: boolean = false
  target!: HTMLInputElement | null
  checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  refreshSubject = new Subject<void>()
  loadingState: boolean = false
  showMessageService: ShowMessageService = inject(ShowMessageService)
  ngOnInit(): void {
    this.target$.subscribe(data => this.target = data)
    this.uncompletedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
      tap(data => {
        this.tasks = data.items.map(item => false)
        this.modalService.initCheckArray(this.tasks)
      }),
      map(data => { return { uncompleted: data.items, completed: null } }),
    )))
    this.allLabels$ = this.api.getAllLabels()
    this.checkArray$.subscribe(data => {
      this.tasks = data
    })
  }

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
    const newTasks = this.tasks.map((task, index) => index === idx ? true : false)
    if (input.checked) {
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
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
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
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
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
}