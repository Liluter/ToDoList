import { Component, DestroyRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, tap, map, combineLatest, startWith, shareReplay } from 'rxjs';
import { Item } from './interfaces/item.interface';
import { ItemCompleted } from './interfaces/item-completed.interface';
import { Label } from './interfaces/label.interface';
import { Tasks } from './interfaces/tasks.interface';
import { Project } from './interfaces/project.interface';
import { SyncProject } from './interfaces/syncProject.interface';
import { FormsModule } from '@angular/forms';
import { Task } from './interfaces/task.interface';
import { AddType, } from './types/modals.d';
import { colors, task, project, label } from './varibles/env';
import { SimpleLabel } from './interfaces/simpleLabel.interface';
import { badgeClass, priorityText } from './utilities/utility';
import { ShowMessageService } from './services/showMessage.service';
import { ApiCallsService } from './services/api-calls.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentDate: string = new Date().toISOString()
  destroyRef = inject(DestroyRef)
  showTasks?: boolean = false
  showCompletedTasks?: boolean = false
  descriptionOpenHandler?: string;
  labels?: Label[]
  projects?: SyncProject[]
  showModal: AddType = { add: 'none' }
  uncompletedTasks$: Observable<Tasks>;
  completedTasks$: Observable<Tasks>;
  allTasks$: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  addTaskModal: boolean = false
  menuObservable$: any;
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  loadingState: boolean = false
  showCompletionMessage: boolean = false
  completionSuccess?: boolean;
  badgeClass = badgeClass
  priorityText = priorityText
  readonly colors = [...colors]

  newTask: Task = { ...task }
  readonly defaultTaskValue: Task = { ...task }

  newProject: Project = { ...project }
  readonly defaultProjectValue: Project = { ...project }

  newLabel: SimpleLabel = { ...label }
  readonly defaultLabelValue: SimpleLabel = { ...label }

  service = inject(ShowMessageService)
  notification$?: Observable<boolean> = this.service.notification$
  message$: Observable<string> = this.service.message$
  type$: Observable<string> = this.service.type$


  constructor(private readonly api: ApiCallsService) {
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

    this.allProjects$ = this.api.getAllProjects().pipe(
      map(data => data.projects),
      tap(projects => this.projects = projects),
      shareReplay()
    )


  }



  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }

  getLabelColor(labelName: string) {
    if (!this.labels) {
      return
    }
    return this.labels.find(label => label.name === labelName)?.color
  }
  getProjectColor(projectName: string) {
    if (!this.projects) {
      return
    }
    return this.projects.find(project => project.name === projectName)?.color
  }

}