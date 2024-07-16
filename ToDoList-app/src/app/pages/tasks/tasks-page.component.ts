import { Component, DestroyRef, EventEmitter, inject } from "@angular/core";
import { Modals, TasksType } from "../../types/modals";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../api-calls.service";
import { combineLatest, EMPTY, from, map, Observable, startWith, switchMap, tap } from "rxjs";
import { Tasks } from "../../interfaces/tasks.interface";
import { Item } from "@angular/fire/analytics";
import { ItemCompleted } from "../../interfaces/item-completed.interface";
import { badgeClass, getLabelColor } from "../../utilities/utility";
import { Label } from "../../interfaces/label.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SyncProject } from "../../interfaces/syncProject.interface";
@Component({
  templateUrl: './tasks-page.component.html',
  standalone: true,
  styleUrl: './tasks-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe]
})
export class TasksPageComponent {
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
  clickEvent = new EventEmitter<'uncompleted' | 'completed' | 'all' | 'none'>()
  tasksEvent: EventEmitter<TasksType>
  constructor(private readonly api: ApiCallsService) {
    this.tasksEvent = this.api.tasksEvent
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
    this.menuObservable$ = from(this.tasksEvent).pipe(
      tap(menu => {
        this.showModal = { ...menu }
      }),
      switchMap(menu => {
        if (menu.tasks) {
          if (menu.tasks === 'uncompleted') {
            return this.uncompletedTasks$
          } else if (menu.tasks === 'completed') {
            return this.completedTasks$
          } else if (menu.tasks === 'all') {
            return this.allTasks$
          } return EMPTY
        }
        return EMPTY
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }


}