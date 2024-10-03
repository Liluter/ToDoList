import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { combineLatest, map, Observable, startWith, switchMap, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { Item } from "@angular/fire/analytics";
import { ItemCompleted } from "../../../interfaces/item-completed.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message } from "../../../types/message.interface";
import { FormsModule } from "@angular/forms";
@Component({
  templateUrl: './all-page.component.html',
  standalone: true,
  styleUrl: './all-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule]
})
export class AllPageComponent implements OnInit {
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
  target$: Observable<HTMLInputElement | null> = this.modalService.target$
  target!: HTMLInputElement | null
  refreshTriger$ = this.api.refreshTrigger
  uncompletedTasks2$!: Observable<Tasks>
  tasks: boolean[] = []
  tasks2: boolean[] = []
  checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  loadingState: boolean = false
  showMessageService: ShowMessageService = inject(ShowMessageService)
  modalShow$: Observable<boolean> = this.modalService.modalShow$
  messageModal$: Observable<string> = this.modalService.message$
  modalDeleteShow$: Observable<boolean> = this.modalService.modalDeleteShow$
  type$ = this.modalService.type$
  ngOnInit(): void {
    this.target$.subscribe(data => this.target = data)
    this.allLabels$ = this.api.getAllLabels()
    // this.uncompletedTasks$ = this.api.getUncompletedTasks().pipe(
    //   map(data => { return { uncompleted: data.items, completed: null } }),
    // )
    this.uncompletedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
      tap(data => {
        this.tasks = data.items.map(item => false)
        this.modalService.initCheckArray(this.tasks)
      }),
      map(data => { return { uncompleted: data.items, completed: null } }),
    )))
    // this.uncompletedTasks2$ = combineLatest([this.refreshTriger$]).pipe(switchMap(() => this.uncompletedTasks$))
    this.completedTasks$ = this.refreshTriger$.pipe(switchMap(() => this.api.getCompletedTasks().pipe(
      tap(data => {
        this.tasks2 = data.items.map(item => true)
        this.modalService.initCheckArray2(this.tasks2)
      }),
      map(data => { return { uncompleted: null, completed: data.items } }),

    )))

    this.allTasks$ = combineLatest([this.uncompletedTasks$, this.completedTasks$]).pipe(
      startWith([null, null]),
      map(([uncompletedTasks, completedTasks]) => {
        return { uncompleted: uncompletedTasks?.uncompleted, completed: completedTasks?.completed }
      })
    )
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
  openModal(id: string, input: HTMLInputElement, action?: 'complete' | 'uncomplete') {
    console.log(input.id)
    if (action === 'complete') {
      const lastIndexOf = input.id.lastIndexOf('-')
      const idx = +input.id.slice(lastIndexOf + 1)
      console.log(idx, this.tasks)
      const newTasks = this.tasks.map((task, index) => index === idx ? true : false)
      if (input.checked) {
        this.modalService.nextCheck(newTasks)
        this.modalService.showModal(id, input, action)
      } else {
        this.modalService.closeModal(idx, false, action)
      }
    } else if (action === 'uncomplete') {
      const lastIndexOf = input.id.lastIndexOf('-')
      const idx = +input.id.slice(lastIndexOf + 1)
      console.log(idx, this.tasks2)
      const newTasks = this.tasks2.map((task, index) => index === idx ? false : true)
      if (!input.checked) {
        this.modalService.nextCheck2(newTasks)
        this.modalService.showModal(id, input, action)
      } else {
        this.modalService.closeModal(idx, true, action)
      }
    }

  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }
  closeModal(action: 'complete' | 'uncomplete') {
    if (action === 'complete') {
      console.log('complete')
      const lastIndexOf = this.target!.id.lastIndexOf('-')
      const idx = +this.target!.id.slice(lastIndexOf + 1)
      this.modalService.closeModal(idx, false, action)
    }
    if (action === 'uncomplete') {
      console.log('uncomplete')
      const lastIndexOf = this.target!.id.lastIndexOf('-')
      const idx = +this.target!.id.slice(lastIndexOf + 1)
      this.modalService.closeModal(idx, true, action)
    }
  }
  closeDeleteModal() {
    this.modalService.closeDeleteModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    // this.api.completeTask(taskId).subscribe();
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
  unCompleteTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.uncompleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: 'success', text: `Task "${taskId}"  uncomplete successfully` })
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