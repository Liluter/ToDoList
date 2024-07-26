import { Component, DestroyRef, EventEmitter, inject } from "@angular/core";
import { ApiCallsService } from "../../../services/api-calls.service";
import { AddType } from "../../../types/modals";
import { combineLatest, EMPTY, from, map, Observable, shareReplay, switchMap, tap } from "rxjs";
import { SyncProjects } from "../../../interfaces/syncProjects.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { FormsModule, NgForm } from "@angular/forms";
import { Task } from "../../../interfaces/task.interface";
import { task } from "../../../varibles/env";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Label } from "../../../interfaces/label.interface";
import { AsyncPipe, DatePipe, NgClass } from "@angular/common";
import { badgeClass } from "../../../utilities/utility";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message } from "../../../types/message.interface";
@Component({
  templateUrl: './add-task-page.component.html',
  styleUrl: './add-task-page.component.scss',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass, AsyncPipe]
})
export class AddTaskPageComponent {
  addEvent: EventEmitter<AddType>
  // projects?: [SyncProject]
  allProjects$?: Observable<[SyncProject]>
  loadingState: boolean = false
  newTask: Task = { ...task }
  readonly defaultTaskValue: Task = { ...task }
  message?: string;
  showCompletionMessage: boolean = false
  completionSuccess?: boolean;
  destroyRef = inject(DestroyRef)
  allLabels$?: Observable<Label[]>;
  // labels?: Label[]
  menuObservable$: any;
  currentDate: string = new Date().toISOString()
  badgeClass = badgeClass
  showMessageService: ShowMessageService = inject(ShowMessageService)
  constructor(private readonly api: ApiCallsService) {
    this.addEvent = this.api.addEvent

    this.allLabels$ = this.api.getAllLabels()

    this.allProjects$ = this.api.allProjects$?.pipe(
      map(data => data.projects),
      // tap(projects => this.projects = projects),
      shareReplay()
    )

    this.menuObservable$ = from(this.addEvent).pipe(
      tap(menu => {
        // this.showModal = { ...menu }
      }),
      switchMap(menu => {
        if (menu.add === 'addTask') {
          return combineLatest([this.allLabels$, this.allProjects$])
        }
        return EMPTY
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }
  addTask() {
    this.addEvent.emit({ add: 'addTask' });
  }

  onAddTask(form: NgForm) {
    this.loadingState = true
    this.api.postTask(this.newTask).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage({ type: 'success', text: `Task "${form.form.controls['title'].value}"  added successfully` })
        this.resetTask(form)
      }
    }, error => {
      this.loadingState = false
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage({ type: 'error', text: message })
    })
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  resetTask(form: NgForm) {
    form.resetForm({ btnradio: this.defaultTaskValue.project_id, dueDate: this.defaultTaskValue.due_date, dueString: this.defaultTaskValue.due_string, labels: this.defaultTaskValue.labels, note: this.defaultTaskValue.description, priority: this.defaultTaskValue.priority, title: this.defaultTaskValue.content })
  }
}