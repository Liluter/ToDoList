import { Component, inject, Input, OnInit } from "@angular/core";
import { ApiCallsService } from "../../services/api-calls.service";
import { map, Observable, tap } from "rxjs";
import { Item } from "../../interfaces/item.interface";
import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { badgeClass, getLabelColor, getProjectColor } from "../../utilities/utility";
import { RouterModule } from "@angular/router";
import { Label } from "../../interfaces/label.interface";
import { SyncProject } from "../../interfaces/syncProject.interface";
import { toSignal } from "@angular/core/rxjs-interop";
@Component({
  templateUrl: './detail.component.html',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, NgClass, DatePipe, RouterModule, NgTemplateOutlet]
})
export class DetailComponent implements OnInit {
  getProjectColor = getProjectColor
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  @Input() id?: string
  apiService: ApiCallsService = inject(ApiCallsService)
  task$?: Observable<Item>
  descriptionOpenHandler: string | undefined;
  allLabels$: Observable<Label[]> = this.apiService.getAllLabels()
  projectId?: string
  project$?: Observable<SyncProject>;
  projects?: SyncProject[]
  allProjectsSignal = toSignal(this.apiService.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
  ngOnInit() {
    if (this.id) {
      this.task$ = this.apiService.getTaskById(this.id).pipe(
        tap(data => {
          this.getProject(data.item.project_id)
        }),
        map(data => data.item)
      )
    }
  }
  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  getProject(id: string) {
    this.project$ = this.apiService.getProjectById(id).pipe(
      map(data => data.project)
    )
  }
}