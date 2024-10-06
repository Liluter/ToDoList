import { Component, inject, Input, OnInit } from "@angular/core";
import { Observable, tap } from "rxjs";
import { Label } from "../../../interfaces/label.interface";
import { ApiCallsService } from "../../../services/api-calls.service";
import { AsyncPipe, NgClass } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { colors } from "../../../varibles/env";
import { Message, MessageStatus } from "../../../types/message.interface";
import { ShowMessageService } from "../../../services/showMessage.service";


@Component({
  templateUrl: './label-edit.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule, FormsModule]
})
export class LabelEditComponent implements OnInit {
  @Input() id?: string
  label$?: Observable<Label>
  readonly colors = [...colors]
  apiService: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  router: Router = inject(Router)
  loadingState: boolean = false
  model: Label = {
    name: '',
    color: '',
    id: '',
    is_favorite: false,
    item_order: 1
  }
  ngOnInit() {
    if (this.id) {
      this.label$ = this.apiService.getOneLabel(this.id).pipe(
        tap(data => {
          this.model = data
        }
        ),
      )
    }
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  saveData(form: NgForm) {
    this.apiService.editLabel(this.model).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage({ type: MessageStatus.success, text: `Label "${form.form.controls['labelname'].value}"  editted successfully` })
        this.router.navigate([`label/details/${this.id}`])
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
}
