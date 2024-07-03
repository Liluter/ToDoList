import { Component, DestroyRef, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from './varibles/env'
import { CommonModule } from '@angular/common';
import { Observable, from, tap, map, switchMap, EMPTY, combineLatest, startWith, empty, of, shareReplay, Subject } from 'rxjs';
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
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Task } from './interfaces/task.interface';
import { Modals, Page, Subpage } from './types/modals';
import { colors } from './varibles/env';
import { RestLabel } from './interfaces/restLabel.interface';
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
  menuEvent = new EventEmitter<Modals>()
  destroyRef = inject(DestroyRef)
  showTasks?: boolean = false
  showCompletedTasks?: boolean = false
  descriptionOpenHandler?: string;
  labels?: Label[]
  projects?: SyncProject[]
  // clickObservable$: Observable<Tasks>;
  // showModal: Modals[] = ['none']
  showModal: Modals = { page: 'none', subpage: 'none' }

  uncompletedTasks$: Observable<Tasks>;
  completedTasks$: Observable<Tasks>;
  allTasks$: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  // noneTasks$: Observable<{ uncompleted: Item[] | null | undefined; completed: ItemCompleted[] | null | undefined; }>;
  addTaskModal: boolean = false
  menuObservable$: any;
  readonly colors = colors
  newTask: Task = {
    content: '',
    description: '',
    due_date: '',
    due_string: '',
    labels: [''],
    priority: 1,
    project_id: '' // inbox"2334294385"
  }
  readonly defaultValue = <Task>{
    content: '',
    description: '',
    due_date: '',
    due_string: '',
    labels: [''],
    priority: 1,
    project_id: ''
  }

  newProject = <Project>{
    color: 'charcoal',
    name: '',
    is_favorite: false,
  }
  readonly defaultProjectValue = <Project>{
    color: 'charcoal',
    name: '',
    is_favorite: false,
  }

  newLabel = <Label>{
    color: 'charcoal',
    name: '',
    is_favorite: false,
  }

  readonly defaultLabelValue = <Label>{
    color: 'charcoal',
    name: '',
    is_favorite: false,
  }
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;


  constructor(private readonly http: HttpClient) {


    this.uncompletedTasks$ = this.http.get<SyncItem>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["items"]'
        }
      }).pipe(
        map(data => { return { uncompleted: data.items, completed: null } }),
      )

    this.completedTasks$ = this.http.get<AllCompleted>("https://api.todoist.com/sync/v9/completed/get_all",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
      }).pipe(
        map(data => { return { uncompleted: null, completed: data.items } }),

      )

    this.allTasks$ = combineLatest([this.uncompletedTasks$, this.completedTasks$]).pipe(
      startWith([null, null]),
      map(([uncompletedTasks, completedTasks]) => {
        return { uncompleted: uncompletedTasks?.uncompleted, completed: completedTasks?.completed }
      })
    )

    this.allLabels$ = this.http.get<Label[]>('https://api.todoist.com/rest/v2/labels', {
      headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
    }).pipe(
      tap(data => this.labels = data),
    )


    this.allProjects$ = this.http.get<SyncProjects>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["projects"]'
        }
      }).pipe(
        map(data => data.projects),
        tap(projects => this.projects = projects),
        shareReplay()
      )


    this.menuObservable$ = from(this.menuEvent).pipe(
      tap(menu => {
        this.showModal = { ...menu }
      }),
      switchMap(menu => {
        if (menu.subpage) {
          if (menu.subpage === 'uncompleted') {
            return this.uncompletedTasks$
          } else if (menu.subpage === 'completed') {
            return this.completedTasks$
          } else if (menu.subpage === 'all') {
            return this.allTasks$
          } return EMPTY
        }
        if (menu.page === 'addTask') {
          return combineLatest([this.allLabels$, this.allProjects$])
        }


        return EMPTY
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  ngOnInit() {

  }

  getCompletedTasks() {
    this.menuEvent.emit({ page: 'listOfTasks', subpage: 'completed' });
  }
  getUncompletedTasks() {
    this.menuEvent.emit({ page: 'listOfTasks', subpage: 'uncompleted' });
  }
  getAllTasks() {
    this.menuEvent.emit({ page: 'listOfTasks', subpage: 'all' });
  }
  getNoneTasks() {
    this.menuEvent.emit({ page: 'none', subpage: 'none' })
  }
  addTask() {
    this.menuEvent.emit({ page: 'addTask' });
  }
  addProject() {
    this.menuEvent.emit({ page: 'addProject' });
  }
  addLabel() {
    this.menuEvent.emit({ page: 'addLabel' });
  }
  getLabels() {
    this.menuEvent.emit({ page: 'listOfLabels' });
  }
  getProjects() {
    this.menuEvent.emit({ page: 'listOfProjects' });
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
    this.http.post('https://api.todoist.com/rest/v2/tasks', this.newTask, {
      headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
    }).subscribe(data => {
      if (data) {
        form.resetForm(this.defaultValue)
      }
    }, error => console.log('ERROR :', error))
  }
  onAddProject(form: NgForm) {
    this.http.post('https://api.todoist.com/rest/v2/projects', this.newProject, {
      headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
    }).subscribe(data => {
      if (data) {
        form.resetForm(this.defaultProjectValue)
      }
    }, error => console.log('ERROR :', error))
  }
  onAddLabel(form: NgForm) {
    // REST APIqq
    console.log(this.newLabel)
    console.log(form)
    this.http.post('https://api.todoist.com/rest/v2/labels', this.newLabel, {
      headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
    }).subscribe(data => {
      if (data) {
        form.resetForm(this.defaultLabelValue)
      }
    }, error => console.log('ERROR :', error))
  }

}