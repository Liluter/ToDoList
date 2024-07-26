import { Component, ViewEncapsulation } from "@angular/core";
import { Label } from "../../interfaces/label.interface";
import { Observable, tap } from "rxjs";
import { AsyncPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../services/api-calls.service";
import { getLabelColor } from "../../utilities/utility";

@Component({
  templateUrl: './labels-page.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  styleUrl: './labels-page.component.scss',
})
export class LabelsPageCompoent {
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  getLabelColor = getLabelColor
  constructor(private readonly api: ApiCallsService) {
    this.allLabels$ = this.api.getAllLabels().pipe(
      tap(data => this.labels = data),
    )
  }

}