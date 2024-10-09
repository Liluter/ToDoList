import { Component, inject, Input, OnInit } from "@angular/core";
import { getProjectColor } from "../../../utilities/utility";
import { map, Observable } from "rxjs";
import { ApiCallsService } from "../../../services/api-calls.service";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { AsyncPipe, NgClass } from "@angular/common";
import { RouterModule } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  templateUrl: './project-detail.component.html',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterModule]
})
export class ProjectDetailComponent implements OnInit {
  getProjectColor = getProjectColor
  @Input() id?: string
  project$?: Observable<SyncProject>
  apiService: ApiCallsService = inject(ApiCallsService)
  ngOnInit() {
    if (this.id) {
      this.project$ = this.apiService.getProjectById(this.id).pipe(
        map(data => data.project)
      )
    }
  }
}