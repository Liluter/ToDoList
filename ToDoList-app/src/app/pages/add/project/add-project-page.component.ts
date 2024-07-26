import { Component, inject } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { ApiCallsService } from "../../../services/api-calls.service";
import { Project } from "../../../interfaces/project.interface";
import { project, colors } from "../../../varibles/env";
import { CommonModule } from '@angular/common';
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message } from "../../../types/message.interface";
@Component({
  templateUrl: './add-project-page.component.html',
  styleUrl: './add-project-page.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddProjectPageComponent {
  loadingState: boolean = false
  newProject: Project = { ...project }
  completionSuccess?: boolean;
  showCompletionMessage: boolean = false
  message?: string;
  readonly defaultProjectValue: Project = { ...project }
  readonly colors = [...colors]
  showMessageService: ShowMessageService = inject(ShowMessageService)
  constructor(private readonly api: ApiCallsService) {

  }

  onAddProject(form: NgForm) {
    this.loadingState = true
    this.api.postProject(this.newProject)
      .subscribe(data => {
        if (data) {
          this.loadingState = false
          this.showMessage({ type: 'success', text: `Project "${form.form.controls['name'].value}"  added successfully` })
          this.resetProject(form)
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
  resetProject(form: NgForm) {
    form.resetForm({ colors: this.defaultProjectValue.color, name: this.defaultProjectValue.name, favourite: this.defaultProjectValue.is_favorite })
  }
}