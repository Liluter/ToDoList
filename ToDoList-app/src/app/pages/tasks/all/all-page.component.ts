import { Component, DestroyRef, inject } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { combineLatest, map, Observable, startWith } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { Item } from "@angular/fire/analytics";
import { ItemCompleted } from "../../../interfaces/item-completed.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
@Component({
  templateUrl: './all-page.component.html',
  standalone: true,
  styleUrl: './all-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule]
})
export class AllPageComponent {
  destroyRef = inject(DestroyRef)
  showModal: TasksType = { tasks: 'none' }
  uncompletedTasks$: Observable<Tasks>;
  completedTasks$: Observable<Tasks>;
  allTasks$: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  constructor(private readonly api: ApiCallsService) {
    this.allLabels$ = this.api.getAllLabels()
    this.uncompletedTasks$ = this.api.getUncompletedTasks().pipe(
      map(data => { return { uncompleted: data.items, completed: null } }),
    )

    this.completedTasks$ = this.api.getCompletedTasks().pipe(
      map(data => { return { uncompleted: null, completed: data.items } }),

    )

    this.allTasks$ = combineLatest([this.uncompletedTasks$, this.completedTasks$]).pipe(
      startWith([null, null]),
      map(([uncompletedTasks, completedTasks]) => {
        return { uncompleted: uncompletedTasks?.uncompleted, completed: completedTasks?.completed }
      })
    )
  }

  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }


}