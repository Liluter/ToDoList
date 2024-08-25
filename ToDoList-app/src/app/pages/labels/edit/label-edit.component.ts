import { Component, Input } from "@angular/core";


@Component({
  templateUrl: './label-edit.component.html',
  standalone: true
})
export class LabelEditComponent {
  @Input() id?: string
}