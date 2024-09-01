import { Component, DestroyRef, EventEmitter, inject, OnInit } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
@Component({
  templateUrl: './completed-page.component.html',
  standalone: true,
  styleUrl: './completed-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule]
})
export class CompletedPageComponent implements OnInit {
  destroyRef = inject(DestroyRef)
  showModal: TasksType = { tasks: 'none' }
  completedTasks$: Observable<Tasks>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  modalService = inject(ShowModalService)
  // api: ApiCallsService = inject(ApiCallsService)
  // uncompletedTasks$!: Observable<Tasks>
  modalShow$: Observable<boolean> = this.modalService.modalShow$
  messageModal$: Observable<string> = this.modalService.message$
  checkArray$: Observable<boolean[]> = this.modalService.checkArray$
  tasks: boolean[] = []
  target$: Observable<HTMLInputElement | null> = this.modalService.target$
  target!: HTMLInputElement | null
  clickEvent = new EventEmitter<'uncompleted' | 'completed' | 'all' | 'none'>()
  tasksEvent: EventEmitter<TasksType>
  constructor(private readonly api: ApiCallsService) {
    this.tasksEvent = this.api.tasksEvent
    this.allLabels$ = this.api.getAllLabels()
    this.completedTasks$ = this.api.getCompletedTasks().pipe(
      tap(data => {
        this.tasks = data.items.map(item => true)
        this.modalService.initCheckArray(this.tasks)
      }),
      map(data => { return { uncompleted: null, completed: data.items } }),
    )
  }

  ngOnInit() {
    this.target$.subscribe(data => this.target = data)
    this.checkArray$.subscribe(data => {
      this.tasks = data
    })
  }

  openModal(id: string, input: HTMLInputElement) {
    console.log('id:', id, 'item', input)
    const lastIndexOf = input.id.lastIndexOf('-')
    const idx = +input.id.slice(lastIndexOf + 1)
    console.log('idx', idx)
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
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    console.log('Send task id :', taskId, 'to service for uncompletion process');
    // this.api.completeTask(taskId).subscribe(); 
    //uncomplete task
    // this.data$ = this.uncompletedTasks$.pipe(refresh())
    this.api.uncompleteTask(taskId).subscribe()
    this.refresh()
    const lastIndexOf = this.target!.id.lastIndexOf('-')
    const idx = +this.target!.id.slice(lastIndexOf + 1)
    this.modalService.closeModal(idx, false)
  }
  refresh() {
    setTimeout(() => {
      this.completedTasks$ = this.api.getCompletedTasks().pipe(
        tap(data => {
          this.tasks = data.items.map(item => true)
          this.modalService.initCheckArray(this.tasks)
        }),
        map(data => { return { uncompleted: null, completed: data.items } }),
      )
    }, 1000)

  }
}