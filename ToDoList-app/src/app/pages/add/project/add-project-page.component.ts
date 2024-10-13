import { Component, inject, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { ApiCallsService } from "../../../services/api-calls.service";
import { Project } from "../../../interfaces/project.interface";
import { defaultProject, colors } from "../../../varibles/env";
import { CommonModule } from '@angular/common';
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message, MessageStatus } from "../../../types/message.interface";
@Component({
  templateUrl: './add-project-page.component.html',
  styleUrl: './add-project-page.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddProjectPageComponent {
  loadingState = signal(false)
  api: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  readonly defaultProjectValue: Project = { ...defaultProject }
  readonly colors = [...colors]
  newProject: Project = { ...defaultProject }

  onAddProject(form: NgForm) {
    this.loadingState.set(true)
    this.api.postProject(this.newProject)
      .subscribe(data => {
        if (data) {
          this.loadingState.set(false)
          this.showMessage({ type: MessageStatus.success, text: `Project "${form.form.controls['name'].value}"  added successfully` })
          this.resetProject(form)
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
  resetProject(form: NgForm) {
    form.resetForm({ colors: this.defaultProjectValue.color, name: this.defaultProjectValue.name, favourite: this.defaultProjectValue.is_favorite })
  }
}