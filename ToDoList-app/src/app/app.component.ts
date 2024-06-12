import { Component, DestroyRef, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from './varibles/env'
import { CommonModule } from '@angular/common';
import { Observable, from, tap, debounceTime, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Item } from './interfaces/item.interface';
import { SyncItem } from './interfaces/syncItem.interface';
import { ItemCompleted } from './interfaces/item-completed.interface';
import { AllCompleted } from './interfaces/all-completed.interface';
import { Label } from './interfaces/label.interface';
import { SyncLabels } from './interfaces/syncLabels.interface';
import { SyncProject } from './interfaces/syncProject.interface';
import { SyncProjects } from './interfaces/syncProjects.interface';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  currentDate: string = new Date().toISOString()
  clickEvent = new EventEmitter<string>()
  destroyRef = inject(DestroyRef)
  showTasks?: boolean = false
  showCompletedTasks?: boolean = false
  clickObservable$: Observable<string>
  completedTasks$?: Observable<[ItemCompleted]>
  uncompletedTasks$?: Observable<Item[]>
  descriptionOpenHandler!: string;
  labels?: [Label]
  projects?: SyncProject[];
  constructor(private readonly http: HttpClient) {
    this.clickObservable$ = from(this.clickEvent)
  }

  ngOnInit() {
    this.fetchProjectList()
    this.fetchLabelsList()

    this.clickObservable$.pipe(
      debounceTime(1000),
      tap((data) => {
        if (data === 'uncompleted') {
          this.fetchUncompletedTasks()
        } else if (data === 'completed') {
          this.fetchCompletedTasks()
        } else if (data === 'all') {
          this.fetchUncompletedTasks()
          this.fetchCompletedTasks()
        }
      }
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
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

  badgeClass(priority: number) {
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
  fetchUncompletedTasks() {
    this.uncompletedTasks$ = this.http.get<SyncItem>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["items"]'
        }
      }).pipe(
        tap(() => this.showTasks = true),
        map(data => data.items),
      )
  }
  fetchCompletedTasks() {
    this.completedTasks$ = this.http.get<AllCompleted>("https://api.todoist.com/sync/v9/completed/get_all",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
      }).pipe(
        tap(() => this.showCompletedTasks = true),
        map(data => data.items)
      )
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

  fetchProjectList() {
    this.http.get<SyncProjects>("https://api.todoist.com/sync/v9/sync",
      {
        headers: { 'Authorization': 'Bearer ' + environment.restApitoken },
        params: {
          sync_token: '*',
          resource_types: '["projects"]'
        }
      }).pipe(
        map(data => data.projects),
      ).subscribe(projects => this.projects = projects)
  }
  openDescription(id: string) {
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
  getProjectById(id: string) {
    return this.projects?.find(project => project.id === id)
  }
}