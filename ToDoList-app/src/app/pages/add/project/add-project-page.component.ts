import { Component } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { ApiCallsService } from "../../../api-calls.service";
import { Project } from "../../../interfaces/project.interface";
import { project, colors } from "../../../varibles/env";
import { CommonModule } from '@angular/common';
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
  constructor(private readonly api: ApiCallsService) {

  }

  onAddProject(form: NgForm) {
    this.loadingState = true
    this.api.postProject(this.newProject)
      .subscribe(data => {
        if (data) {
          this.loadingState = false
          this.showMessage('complete', `Project "${form.form.controls['name'].value}"  added successfully`)
          this.resetProject(form)
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage('error', message)
      })
  }
  showMessage(kind: string, message: string) {
    this.message = message
    if (kind === 'complete') {
      this.completionSuccess = true
      this.showCompletionMessage = true
      setTimeout(() => { this.showCompletionMessage = false }, 6000)
    }
    if (kind === 'error') {
      this.completionSuccess = false
      this.showCompletionMessage = true
      setTimeout(() => { this.showCompletionMessage = false }, 6000)
    }
  }
  resetProject(form: NgForm) {
    form.resetForm({ colors: this.defaultProjectValue.color, name: this.defaultProjectValue.name, favourite: this.defaultProjectValue.is_favorite })
  }
}