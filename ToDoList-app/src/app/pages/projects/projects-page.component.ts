import { Component } from "@angular/core";
import { ApiCallsService } from "../../services/api-calls.service";
import { SyncProject } from "../../interfaces/syncProject.interface";
import { map, Observable, shareReplay, tap } from "rxjs";
import { AsyncPipe, NgClass } from "@angular/common";
import { getProjectColor } from "../../utilities/utility";
@Component({
  templateUrl: './projects-page.component.html',
  standalone: true,
  imports: [NgClass, AsyncPipe],
  styleUrl: './projects-page.component.scss'
})
export class ProjectsPageComponent {

  projects?: SyncProject[]
  allProjects$?: Observable<[SyncProject]>;
  getProjectColor = getProjectColor
  constructor(private readonly api: ApiCallsService) {
    this.allProjects$ = this.api.getAllProjects().pipe(
      map(data => data.projects),
      tap(projects => this.projects = projects),
      shareReplay()
    )
  }
}