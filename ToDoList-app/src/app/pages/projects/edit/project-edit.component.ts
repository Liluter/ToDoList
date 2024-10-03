import { Component, inject, Input } from "@angular/core";
import { ApiCallsService } from "../../../services/api-calls.service";
import { getProjectColor } from "../../../utilities/utility";
import { map, Observable, tap } from "rxjs";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { AsyncPipe, NgClass } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { colors } from "../../../varibles/env";
import { Router, RouterModule } from "@angular/router";
import { Message } from "../../../types/message.interface";
import { ShowMessageService } from "../../../services/showMessage.service";

@Component({
  templateUrl: './project-edit.component.html',
  standalone: true,
  imports: [AsyncPipe, FormsModule, NgClass, RouterModule]
})
export class ProjectEditCompoennt {
  @Input() id?: string
  getProjectColor = getProjectColor
  readonly colors = [...colors]
  project$?: Observable<SyncProject>
  apiService: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  router: Router = inject(Router)
  loadingState: boolean = false
  model: SyncProject = {
    id: '',
    color: '',
    name: '',
    is_favorite: false
  }
  ngOnInit() {
    if (this.id) {
      this.project$ = this.apiService.getProjectById(this.id).pipe(
        map(data => data.project),
        tap(data => {
          this.model = data
        })
      )
    }
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  saveData(form: NgForm) {
    console.log('model', this.model)
    console.log('form', form.form)
    this.apiService.editProject(this.model).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage({ type: 'success', text: `Project "${form.form.controls['projectname'].value}"  editted successfully` })
        this.router.navigate([`projects`])
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
}
