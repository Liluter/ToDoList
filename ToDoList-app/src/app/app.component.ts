import { Component, DestroyRef, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from './varibles/env'
import { CommonModule } from '@angular/common';
import { Observable, from, tap, map, switchMap, EMPTY, combineLatest, startWith, empty, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Item } from './interfaces/item.interface';
import { SyncItem } from './interfaces/syncItem.interface';
import { ItemCompleted } from './interfaces/item-completed.interface';
import { AllCompleted } from './interfaces/all-completed.interface';
import { Label } from './interfaces/label.interface';
import { SyncLabels } from './interfaces/syncLabels.interface';
import { Tasks } from './interfaces/tasks.interface';
import { Project } from './interfaces/project.interface';
import { SyncProjects } from './interfaces/syncProjects.interface';
import { SyncProject } from './interfaces/syncProject.interface';
import { Form, FormsModule } from '@angular/forms';
import { Task } from './interfaces/task.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  currentDate: string = new Date().toISOString()
  clickEvent = new EventEmitter<'uncompleted' | 'completed' | 'all' | 'none'>()
  destroyRef = inject(DestroyRef)
  showTasks?: boolean = false
  showCompletedTasks?: boolean = false
  descriptionOpenHandler?: string;
  labels?: Label[]
  projects?: SyncProject[]
  clickObservable$: Observable<Tasks>;

  uncompletedTasks$: Observable<Tasks>;
  completedTasks$: Observable<Tasks>;
  allTasks$: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  addTaskModal: boolean = false
  newTask = <Task>{
    content: '',
    description: '',
    due: { date: '', string: '' },
    labels: [''],
    priority: 1,
    project_id: '' // inbox"2334294385"
  }


  constructor(private readonly http: HttpClient) {

    this.uncompletedTasks$ = this.http.get<SyncItem>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["items"]'
        }
      }).pipe(
        tap(() => {
          this.addTaskModal = false
          this.showTasks = true
          this.showCompletedTasks = false
        }),
        map(data => { return { uncompleted: data.items, completed: null } }),
      )

    this.completedTasks$ = this.http.get<AllCompleted>("https://api.todoist.com/sync/v9/completed/get_all",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
      }).pipe(
        tap(() => {
          this.addTaskModal = false
          this.showTasks = false
          this.showCompletedTasks = true
        }),
        map(data => { return { uncompleted: null, completed: data.items } }),

      )

    this.allTasks$ = combineLatest([this.uncompletedTasks$, this.completedTasks$]).pipe(
      startWith([null, null]),
      tap(() => {
        this.addTaskModal = false
        this.showTasks = true
        this.showCompletedTasks = true
      }),
      map(([uncompletedTasks, completedTasks]) => {
        return { uncompleted: uncompletedTasks?.uncompleted, completed: completedTasks?.completed }
      })
    )

    this.clickObservable$ = from(this.clickEvent).pipe(
      switchMap(data => {
        if (data === 'uncompleted') {
          return this.uncompletedTasks$
        } else if (data === 'completed') {
          return this.completedTasks$
        } else if (data === 'all') {
          return this.allTasks$
        } else if (data === 'none') {
          this.showTasks = false
          this.showCompletedTasks = false
          return EMPTY
        }
        return EMPTY
      }),
    )
  }

  ngOnInit() {
    this.fetchLabelsList()
    this.fetchProjectsList()
  }

  getCompletedTasks() {
    this.clickEvent.emit('completed');
  }
  getUncompletedTasks() {
    this.clickEvent.emit('uncompleted');
  }
  getAllTasks() {
    this.clickEvent.emit('all');
  }
  getNoneTasks() {
    this.clickEvent.emit('none');
  }
  badgeClass(priority: number | undefined) {
    switch (priority) {
      case 1:
        return 'text-bg-secondary'
      case 2:
        return 'text-bg-primary'
      case 3:
        return 'text-bg-warning'
      case 4:
        return 'text-bg-danger'
      default:
        return 'text-bg-secondary'
    }
  }
  priorityText(priority: number) {
    switch (priority) {
      case 1:
        return '4'
      case 2:
        return '3'
      case 3:
        return '2'
      case 4:
        return '1'
      default:
        return '4'
    }
  }
  fetchLabelsList() {
    this.http.get<SyncLabels>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["labels"]'
        }
      }).pipe(
        map(data => data.labels),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(data => this.labels = [...data])
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
  // getProjectById(id: string) {
  //   return this.projects?.find(project => project.id === id)
  // }

  addTask() {
    this.getNoneTasks()
    this.addTaskModal = !this.addTaskModal

    console.log('toggle adddTask')
  }
  selectLabel(name: string) {
    console.log('Label ', name, ' selected')
  }
  fetchProjectsList() {
    this.http.get<SyncProjects>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["projects"]'
        }
      }).pipe(
        tap(data => console.dir(data)),
        map(data => data.projects),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(data => this.projects = [...data])
  }

  onAddTask(form: Form) {
    console.log(form);
    console.dir(this.newTask)
    // REST API
    this.http.post('https://api.todoist.com/rest/v2/tasks', this.newTask, {
      headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
      params: {
        sync_token: '*'
      }
    }).subscribe(data => console.log('Respose from server :', data), error => console.log(error))
  }

}