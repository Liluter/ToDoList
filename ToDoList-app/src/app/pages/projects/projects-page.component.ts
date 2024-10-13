import { Component, inject, Signal } from "@angular/core";
import { ApiCallsService } from "../../services/api-calls.service";
import { SyncProject } from "../../interfaces/syncProject.interface";
import { map, Observable, shareReplay, tap } from "rxjs";
import { AsyncPipe, NgClass } from "@angular/common";
import { getProjectColor } from "../../utilities/utility";
import { RouterModule } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
@Component({
  templateUrl: './projects-page.component.html',
  standalone: true,
  imports: [NgClass, AsyncPipe, RouterModule],
  styleUrl: './projects-page.component.scss'
})
export class ProjectsPageComponent {
  getProjectColor = getProjectColor
  api: ApiCallsService = inject(ApiCallsService)
  allProjects: Signal<[SyncProject] | null> = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
}