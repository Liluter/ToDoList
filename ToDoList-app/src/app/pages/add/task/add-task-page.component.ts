import { Component, inject, signal, Signal } from "@angular/core";
import { AsyncPipe, DatePipe, NgClass } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";

import { map, tap } from "rxjs";

import { SyncProject } from "../../../interfaces/syncProject.interface";
import { Label } from "../../../interfaces/label.interface";
import { Task } from "../../../interfaces/task.interface";
import { Message, MessageStatus } from "../../../types/message.interface";

import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { task } from "../../../varibles/env";

import { ApiCallsService } from "../../../services/api-calls.service";
import { ShowMessageService } from "../../../services/showMessage.service";

@Component({
  templateUrl: './add-task-page.component.html',
  styleUrl: './add-task-page.component.scss',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass, AsyncPipe]
})
export class AddTaskPageComponent {
  api: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  allProjects: Signal<[SyncProject] | null> = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
  allLabelsSignal: Signal<Label[]> = toSignal(this.api.getAllLabels().pipe(tap(labels => this.labels = labels.map(label => label.name))), { initialValue: [] })

  loadingState = signal(false)
  readonly defaultTaskValue: Task = { ...task }
  newTask: Task = { ...task }
  currentDate: string = new Date().toISOString()
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  labels: string[] = []

  onAddTask(form: NgForm) {
    this.loadingState.set(true)
    let newTask = { ...this.newTask }
    newTask.labels = this.convertLabelBoolToStr()
    this.api.postTask(newTask).subscribe(data => {
      if (data) {
        this.loadingState.set(false)
        this.showMessage({ type: MessageStatus.success, text: `Task "${form.form.controls['title'].value}"  added successfully` })
        this.resetTask(form)
      }
    }, error => {
      this.loadingState.set(false)
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