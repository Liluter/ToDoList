import { Component, DestroyRef, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, from, tap, map, switchMap, EMPTY, combineLatest, startWith, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Item } from './interfaces/item.interface';
import { ItemCompleted } from './interfaces/item-completed.interface';
import { Label } from './interfaces/label.interface';
import { Tasks } from './interfaces/tasks.interface';
import { Project } from './interfaces/project.interface';
import { SyncProject } from './interfaces/syncProject.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { Task } from './interfaces/task.interface';
import { AddType, Modals, TasksType } from './types/modals.d';
import { colors, task, project, label } from './varibles/env';
import { ApiCallsService } from './api-calls.service';
import { SimpleLabel } from './interfaces/simpleLabel.interface';
import { badgeClass, priorityText } from './utilities/utility';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentDate: string = new Date().toISOString()
  // clickEvent = new EventEmitter<'uncompleted' | 'completed' | 'all' | 'none'>()
  tasksEvent: EventEmitter<TasksType>
  addEvent: EventEmitter<AddType>
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
  message?: string;
  badgeClass = badgeClass
  priorityText = priorityText
  readonly colors = [...colors]

  newTask: Task = { ...task }
  readonly defaultTaskValue: Task = { ...task }

  newProject: Project = { ...project }
  readonly defaultProjectValue: Project = { ...project }

  newLabel: SimpleLabel = { ...label }
  readonly defaultLabelValue: SimpleLabel = { ...label }


  constructor(private readonly api: ApiCallsService) {
    this.tasksEvent = this.api.tasksEvent
    this.addEvent = this.api.addEvent
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
    // this.allLabels$ = this.api.getAllLabels().pipe(
    //   tap(data => this.labels = data),
    // )

    this.allProjects$ = this.api.getAllProjects().pipe(
      map(data => data.projects),
      tap(projects => this.projects = projects),
      shareReplay()
    )

    this.menuObservable$ = from(this.addEvent).pipe(
      tap(menu => {
        this.showModal = { ...menu }
      }),
      switchMap(menu => {
        if (menu.add === 'addTask') {
          return combineLatest([this.allLabels$, this.allProjects$])
        }
        return EMPTY
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  // getCompletedTasks() {
  //   this.tasksEvent.emit({ tasks: 'completed' });
  // }
  // getUncompletedTasks() {
  //   this.tasksEvent.emit({ tasks: 'uncompleted' });
  // }
  getAllTasks() {
    this.tasksEvent.emit({ tasks: 'all' });
  }
  // getNoneTasks() {
  //   this.menuEvent.emit({ page: 'none', subpage: 'none' })
  // }
  addTask() {
    this.addEvent.emit({ add: 'addTask' });
  }
  addProject() {
    this.addEvent.emit({ add: 'addProject' });
  }
  addLabel() {
    this.addEvent.emit({ add: 'addLabel' });
  }
  // getLabels() {
  //   this.menuEvent.emit({ page: 'listOfLabels' });
  // }
  // getProjects() {
  //   this.menuEvent.emit({ page: 'listOfProjects' });
  // }

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

  onAddTask(form: NgForm) {
    this.loadingState = true
    this.api.postTask(this.newTask).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage('complete', `Task "${form.form.controls['title'].value}"  added successfully`)
        this.resetTask(form)
      }
    }, error => {
      this.loadingState = false
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage('error', message)
    })
  }
  onAddProject(form: NgForm) {
    this.loadingState = true
    this.api.postProject(this.newProject)
      .subscribe(data => {
        if (data) {
          this.loadingState = false
          this.showMessage('complete', `Project "${form.form.controls['name'].value}"  added successfully`)
          this.resetProject(form)
        }
      }, error => {
        this.loadingState = false
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage('error', message)
      })
  }

  onAddLabel(form: NgForm) {
    // REST APIqq
    this.loadingState = true
    this.api.postLabel(this.newLabel).subscribe(data => {

      if (data) {
        this.loadingState = false
        this.showMessage('complete', `Label "${form.form.controls['name'].value}"  added successfully`)
        this.resetLabel(form)
      }
    }, error => {
      this.loadingState = false
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage('error', message)
    })
  }
  showMessage(kind: string, message: string) {
    this.message = message
    if (kind === 'complete') {
      this.completionSuccess = true
      this.showCompletionMessage = true
      setTimeout(() => { this.showCompletionMessage = false }, 6000)
    }
    if (kind === 'error') {
      this.completionSuccess = false
      this.showCompletionMessage = true
      setTimeout(() => { this.showCompletionMessage = false }, 6000)
    }
  }
  resetLabel(form: NgForm) {
    form.resetForm({ colors: this.defaultLabelValue.color, name: this.defaultLabelValue.name, favourite: this.defaultLabelValue.is_favorite })
  }
  resetProject(form: NgForm) {
    form.resetForm({ colors: this.defaultProjectValue.color, name: this.defaultProjectValue.name, favourite: this.defaultProjectValue.is_favorite })
  }
  resetTask(form: NgForm) {
    form.resetForm({ btnradio: this.defaultTaskValue.project_id, dueDate: this.defaultTaskValue.due_date, dueString: this.defaultTaskValue.due_string, labels: this.defaultTaskValue.labels, note: this.defaultTaskValue.description, priority: this.defaultTaskValue.priority, title: this.defaultTaskValue.content })
  }
}