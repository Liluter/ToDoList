import { Component, Input } from "@angular/core";

@Component({
  templateUrl: './edit.component.html',
  standalone: true
})
export class EditComponent {
  @Input() id?: string
}