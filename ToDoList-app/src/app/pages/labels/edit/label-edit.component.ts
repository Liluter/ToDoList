import { Component, effect, inject, input, signal, WritableSignal } from "@angular/core";
import { Observable, switchMap, tap } from "rxjs";
import { Label } from "../../../interfaces/label.interface";
import { ApiCallsService } from "../../../services/api-calls.service";
import { AsyncPipe, NgClass } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { colors } from "../../../varibles/env";
import { Message, MessageStatus } from "../../../types/message.interface";
import { ShowMessageService } from "../../../services/showMessage.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";


@Component({
  templateUrl: './label-edit.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule, FormsModule]
})
export class LabelEditComponent {
  router = inject(Router)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  api: ApiCallsService = inject(ApiCallsService)
  id = input.required<string>();
  readonly colors = [...colors]
  loadingState: WritableSignal<boolean> = signal(false)
  model: Label = {
    name: '',
    color: '',
    id: '',
    is_favorite: false,
    item_order: 1
  }
  labelSignal = toSignal(toObservable(this.id).pipe(switchMap((id) => this.api.getOneLabel(id))))

  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
  saveData(form: NgForm) {
    this.loadingState.set(true)
    this.api.editLabel(this.model).subscribe(data => {
      if (data) {
        this.loadingState.set(false)
        this.showMessage({ type: MessageStatus.success, text: `Label "${form.form.controls['labelname'].value}"  editted successfully` })
        this.router.navigate([`labels`])
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
  deleteLabel() {
    this.loadingState.set(true)
    this.api.deleteLabel(this.model.id).subscribe(() => {
      this.loadingState.set(false)
      this.loadingState.set(false)
      this.showMessage({ type: MessageStatus.success, text: `Label "${this.model.name}"  deleted successfully` })
      this.router.navigate([`labels`])
    }, error => {
      this.loadingState.set(false)
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage({ type: MessageStatus.error, text: message })
    })
  }
}
