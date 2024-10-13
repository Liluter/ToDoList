import { Component, inject, Signal } from "@angular/core";
import { Label } from "../../interfaces/label.interface";
import { Observable, tap } from "rxjs";
import { AsyncPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../services/api-calls.service";
import { getLabelColor } from "../../utilities/utility";
import { RouterModule } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  templateUrl: './labels-page.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule],
  styleUrl: './labels-page.component.scss',
})
export class LabelsPageCompoent {
  allLabels$?: Observable<Label[]>;
  getLabelColor = getLabelColor
  api: ApiCallsService = inject(ApiCallsService)
  allLabels: Signal<Label[] | null> = toSignal(this.api.getAllLabels(), { initialValue: null })
}