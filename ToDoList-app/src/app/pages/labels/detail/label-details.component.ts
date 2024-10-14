import { Component, effect, inject, input, Input, OnInit, signal, WritableSignal } from "@angular/core"
import { ApiCallsService } from "../../../services/api-calls.service"
import { Label } from "../../../interfaces/label.interface"
import { Observable, switchMap } from "rxjs"
import { AsyncPipe, NgClass } from "@angular/common"
import { getLabelColor } from "../../../utilities/utility"
import { RouterModule } from "@angular/router"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"

@Component({
  templateUrl: './label-details.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule]
})
export class LabelDetailsComponent {
  getLabelColor = getLabelColor
  // @Input() id?: string
  id = input.required<string>()
  label$?: Observable<Label>
  apiService: ApiCallsService = inject(ApiCallsService)
  labelSignal = toSignal(toObservable(this.id).pipe(switchMap(id => this.apiService.getOneLabel(id))))


  // constructor() {
  //   effect(() => { this.apiService.getOneLabel(this.id()).subscribe(label => this.labelSignal.set(label)) })
  // }
  // ngOnInit() {
  //   if (this.id) {
  //     this.label$ = this.apiService.getOneLabel(this.i)
  //   }
  // }
}