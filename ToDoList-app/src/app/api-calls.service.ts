import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Label } from './interfaces/label.interface';
import { environment } from './varibles/env';
import { Observable } from 'rxjs';
import { completedUrl, labelsUrl, projectsUrl, syncUrl, tasksUrl } from './varibles/urls';
import { SyncItem } from './interfaces/syncItem.interface';
import { AllCompleted } from './interfaces/all-completed.interface';
import { SyncProjects } from './interfaces/syncProjects.interface';
import { Project } from './interfaces/project.interface';
import { Task } from './interfaces/task.interface';
import { SimpleLabel } from './interfaces/simpleLabel.interface';
import { AddType, Modals, TasksType } from './types/modals';
@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  private authorization: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + environment.restApitoken
  })
  private itemsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["items"]' } })
  private projectsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["projects"]' } })

  tasksEvent = new EventEmitter<TasksType>()
  addEvent = new EventEmitter<AddType>()
  constructor(private readonly http: HttpClient) {

  }

  getUncompletedTasks(): Observable<SyncItem> {
    return this.http.get<SyncItem>(syncUrl,
      {
        headers: this.authorization,
        params: this.itemsParams
      })
  }
  getCompletedTasks(): Observable<AllCompleted> {
    return this.http.get<AllCompleted>(completedUrl,
      {
        headers: this.authorization
      })
  }

  getAllProjects(): Observable<SyncProjects> {
    return this.http.get<SyncProjects>(syncUrl,
      {
        headers: this.authorization,
        params: this.projectsParams
      })
  }

  getAllLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(labelsUrl, { headers: this.authorization })
  }

  postLabel(data: SimpleLabel) {
    return this.http.post(labelsUrl, data, {
      headers: this.authorization
    })
  }
  postProject(data: Project) {
    return this.http.post(projectsUrl, data, {
      headers: this.authorization
    })
  }
  postTask(data: Task) {
    return this.http.post(tasksUrl, data, {
      headers: this.authorization
    })
  }
}