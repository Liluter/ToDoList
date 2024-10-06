import { Component, inject } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { ApiCallsService } from "../../../services/api-calls.service";
import { SimpleLabel } from "../../../interfaces/simpleLabel.interface";
import { colors, label } from "../../../varibles/env";
import { CommonModule } from "@angular/common";
import { ShowMessageService } from "../../../services/showMessage.service";
import { Message, MessageStatus } from "../../../types/message.interface";

@Component({
  templateUrl: './add-label-page.component.html',
  styleUrl: './add-label-page.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddLabelPageComponent {
  loadingState: boolean = false
  newLabel: SimpleLabel = { ...label }
  message?: string;
  showCompletionMessage: boolean = false
  completionSuccess?: boolean;
  readonly defaultLabelValue: SimpleLabel = { ...label }
  readonly colors = [...colors]
  showMessageService: ShowMessageService = inject(ShowMessageService)
  constructor(private readonly api: ApiCallsService) {

  }
  onAddLabel(form: NgForm) {
    // REST APIqq
    this.loadingState = true
    this.api.postLabel(this.newLabel).subscribe(data => {

      if (data) {
        this.loadingState = false
        this.showMessage({ type: MessageStatus.success, text: `Label "${form.form.controls['name'].value}"  added successfully` })
        this.resetLabel(form)
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
  resetLabel(form: NgForm) {
    form.resetForm({ colors: this.defaultLabelValue.color, name: this.defaultLabelValue.name, favourite: this.defaultLabelValue.is_favorite })
  }
}