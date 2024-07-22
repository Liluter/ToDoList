import { Component, DestroyRef, EventEmitter, inject } from "@angular/core";
import { TasksType } from "../../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../api-calls.service";
import { map, Observable } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
@Component({
  templateUrl: './completed-page.component.html',
  standalone: true,
  styleUrl: './completed-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe]
})
export class CompletedPageComponent {
  destroyRef = inject(DestroyRef)
  showModal: TasksType = { tasks: 'none' }
  completedTasks$: Observable<Tasks>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  clickEvent = new EventEmitter<'uncompleted' | 'completed' | 'all' | 'none'>()
  tasksEvent: EventEmitter<TasksType>
  constructor(private readonly api: ApiCallsService) {
    this.tasksEvent = this.api.tasksEvent
    this.allLabels$ = this.api.getAllLabels()
    this.completedTasks$ = this.api.getCompletedTasks().pipe(
      map(data => { return { uncompleted: null, completed: data.items } }),
    )
  }

}