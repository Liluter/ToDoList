import { Component, inject, Input, OnInit } from "@angular/core"
import { ApiCallsService } from "../../../services/api-calls.service"
import { Label } from "../../../interfaces/label.interface"
import { Observable } from "rxjs"
import { AsyncPipe, NgClass } from "@angular/common"
import { getLabelColor } from "../../../utilities/utility"

@Component({
  templateUrl: './label-details.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass]
})
export class LabelDetailsComponent implements OnInit {
  @Input() id?: string
  label$?: Observable<Label>
  apiService: ApiCallsService = inject(ApiCallsService)
  getLabelColor = getLabelColor
  ngOnInit() {
    if (this.id) {
      this.label$ = this.apiService.getOneLabel(this.id)
    }
  }
}