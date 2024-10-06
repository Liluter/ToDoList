import { Component, DestroyRef, EventEmitter, inject } from "@angular/core";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, shareReplay, tap } from "rxjs";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { FormsModule, NgForm } from "@angular/forms";
import { Task } from "../../../interfaces/task.interface";
import { task } from "../../../varibles/env";
import { Label } from "../../../interfaces/label.interface";
import { AsyncPipe, DatePipe, NgClass } from "@angular/common";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message, MessageStatus } from "../../../types/message.interface";
@Component({
  templateUrl: './add-task-page.component.html',
  styleUrl: './add-task-page.component.scss',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass, AsyncPipe]
})
export class AddTaskPageComponent {
  allProjects$?: Observable<[SyncProject]>
  loadingState: boolean = false
  newTask: Task = { ...task }
  readonly defaultTaskValue: Task = { ...task }
  message?: string;
  showCompletionMessage: boolean = false
  completionSuccess?: boolean;
  destroyRef = inject(DestroyRef)
  allLabels$?: Observable<Label[]>;
  menuObservable$: any;
  currentDate: string = new Date().toISOString()
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  showMessageService: ShowMessageService = inject(ShowMessageService)
  labels: string[] = []
  constructor(private readonly api: ApiCallsService) {

    this.allLabels$ = this.api.getAllLabels().pipe(
      tap(labels => this.labels = labels.map(label => label.name)))

    this.allProjects$ = this.api.allProjects$?.pipe(
      map(data => data.projects),
      shareReplay()
    )
  }

  onAddTask(form: NgForm) {
    this.loadingState = true
    let newTask = { ...this.newTask }
    newTask.labels = this.convertLabelBoolToStr()
    this.api.postTask(newTask).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage({ type: MessageStatus.success, text: `Task "${form.form.controls['title'].value}"  added successfully` })
        this.resetTask(form)
      }
    }, error => {
      this.loadingState = false
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage({ type: MessageStatus.error, text: message })
    })
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  resetTask(form: NgForm) {
    form.resetForm({ btnradio: this.defaultTaskValue.project_id, dueDate: this.defaultTaskValue.due_date, dueString: this.defaultTaskValue.due_string, labels: this.defaultTaskValue.labels, note: this.defaultTaskValue.description, priority: this.defaultTaskValue.priority, title: this.defaultTaskValue.content })
  }
  onCheckBoxChange(event: any, idx: number) {
    this.newTask.labels[idx] = event.target.checked ? true : false
  }
  convertLabelBoolToStr() {
    let labels = this.newTask.labels.map((bool, idx) => bool ? this.labels[idx] : '')
    labels = labels.filter(label => label !== '')
    return labels
  }
}