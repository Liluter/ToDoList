import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Label } from '../interfaces/label.interface';
import { environment } from '../varibles/env';
import { EMPTY, Observable, Subject } from 'rxjs';
import { completedUrl, labelsUrl, projectsUrl, syncUrl, tasksUrl, itemUrl, getProjectUrl } from '../varibles/urls';
import { SyncItem } from '../interfaces/syncItem.interface';
import { AllCompleted } from '../interfaces/all-completed.interface';
import { SyncProjects } from '../interfaces/syncProjects.interface';
import { Project } from '../interfaces/project.interface';
import { Task } from '../interfaces/task.interface';
import { SimpleLabel } from '../interfaces/simpleLabel.interface';
import { GetItem } from '../interfaces/getItem.interface';
import { SyncProject } from '../interfaces/syncProject.interface';
import { GetSyncProject } from '../interfaces/getSyncProject.interface';
import { EditData } from '../interfaces/editData.interface';
import * as uuid from 'uuid';
import { Sync } from '../interfaces/sync.interface';
@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  private authorization: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + environment.restApitoken
  })
  private itemsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["items"]' } })

  private projectsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["projects"]' } })

  refreshTrigger: Subject<void> = new Subject()

  allProjects$?: Observable<SyncProjects>
  constructor(private readonly http: HttpClient) {
    this.allProjects$ = this.http.get<SyncProjects>(syncUrl,
      {
        headers: this.authorization,
        params: this.projectsParams
      })

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
  getOneLabel(id: string): Observable<Label> {
    return this.http.get<Label>(labelsUrl + `/${id}`, { headers: this.authorization })
  }
  postLabel(data: SimpleLabel) {
    return this.http.post(labelsUrl, data, {
      headers: this.authorization
    })
  }

  deleteLabel(id: string): Observable<Object> {
    return this.http.delete(labelsUrl + `/${id}`, { headers: this.authorization })
  }

  postProject(data: Project) {
    return this.http.post(projectsUrl, data, {
      headers: this.authorization
    })
  }
  deleteProject(id: string) {
    return this.http.delete(projectsUrl + `/${id}`, { headers: this.authorization })

  }
  postTask(data: Task) {
    return this.http.post(tasksUrl, data, {
      headers: this.authorization
    })
  }
  getTaskById(id: string): Observable<GetItem> {
    if (id) {
      const itemParams = new HttpParams({ fromObject: { all_data: 'false', item_id: id } })
      return this.http.get<GetItem>(itemUrl,
        {
          headers: this.authorization,
          params: itemParams
        })
    } else {
      return EMPTY
    }
  }
  getProjectById(id?: string) {
    if (id) {
      const itemParams = new HttpParams({ fromObject: { all_data: 'false', project_id: id } })
      return this.http.get<GetSyncProject>(getProjectUrl,
        {
          headers: this.authorization,
          params: itemParams
        })
    } else {
      return EMPTY
    }
  }
  editTask(data: EditData) {
    const myuuid = uuid.v4();
    const body = {
      commands: [
        {
          "type": "item_update",
          "uuid": myuuid,
          "args": {
            "id": data.id,
            "priority": data.priority,
            "description": data.description,
            "content": data.content,
            "due": data.due,
            "labels": data.labels
          }
        }
      ]
    }
    if (data) {
      return this.http.post(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
  editLabel(data: Label) {
    const myuuid = uuid.v4();
    const body = {
      commands: [{
        "type": "label_update",
        "uuid": myuuid,
        "args": {
          "id": data.id,
          "color": data.color,
          "name": data.name,
          "item_order": data.item_order,
          "is_favorite": data.is_favorite
        }
      }
      ]
    }
    if (data) {
      return this.http.post(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
  editProject(data: SyncProject) {
    const myuuid = uuid.v4();
    const body = {
      commands: [{
        "type": "project_update",
        "uuid": myuuid,
        "args": {
          "id": data.id,
          "color": data.color,
          "name": data.name,
          "is_favorite": data.is_favorite
        }
      }
      ]
    }
    if (data) {
      return this.http.post(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
  completeTask(id: string) {
    const myuuid = uuid.v4();
    const body = {
      commands: [{
        "type": "item_complete",
        "uuid": myuuid,
        "args": {
          "id": id,
        }
      }]
    }
    if (id) {
      return this.http.post<Sync>(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
  uncompleteTask(id: string) {
    const myuuid = uuid.v4();
    const body = {
      commands: [{
        "type": "item_uncomplete",
        "uuid": myuuid,
        "args": {
          "id": id,
        }
      }]
    }
    if (id) {
      return this.http.post<Sync>(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
  deleteTask(id: string) {
    const myuuid = uuid.v4();
    const body = {
      commands: [{
        "type": "item_delete",
        "uuid": myuuid,
        "args": {
          "id": id,
        }
      }]
    }
    if (id) {
      return this.http.post(syncUrl, body, { headers: this.authorization })
    } else {
      return EMPTY
    }
  }
}