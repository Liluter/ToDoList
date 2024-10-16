import { Component, inject, Input, OnInit } from "@angular/core"
import { ApiCallsService } from "../../../services/api-calls.service"
import { Label } from "../../../interfaces/label.interface"
import { Observable } from "rxjs"
import { AsyncPipe, NgClass } from "@angular/common"
import { getLabelColor } from "../../../utilities/utility"
import { RouterModule } from "@angular/router"

@Component({
  templateUrl: './label-details.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule]
})
export class LabelDetailsComponent implements OnInit {
  getLabelColor = getLabelColor
  @Input() id?: string
  label$?: Observable<Label>
  apiService: ApiCallsService = inject(ApiCallsService)
  ngOnInit() {
    if (this.id) {
      this.label$ = this.apiService.getOneLabel(this.id)
    }
  }
}