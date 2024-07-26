import { Component, Input } from "@angular/core";

@Component({
  templateUrl: './detail.component.html',
  standalone: true
})
export class DetailComponent {
  @Input() id?: string
}