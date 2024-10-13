import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';

import { AllCompleted } from '../interfaces/all-completed.interface';
import { EditTask } from '../interfaces/editTask.interface';
import { GetItem } from '../interfaces/getItem.interface';
import { GetSyncProject } from '../interfaces/getSyncProject.interface';
import { Label } from '../interfaces/label.interface';
import { SyncItem } from '../interfaces/syncItem.interface';
import { Project } from '../interfaces/project.interface';
import { SimpleLabel } from '../interfaces/simpleLabel.interface';
import { SyncProject } from '../interfaces/syncProject.interface';
import { SyncProjects } from '../interfaces/syncProjects.interface';
import { Task } from '../interfaces/task.interface';
import { Sync } from '../interfaces/sync.interface';

import { completedUrl, labelsUrl, projectsUrl, syncUrl, tasksUrl, itemUrl, getProjectUrl } from '../varibles/urls';
import { environment } from '../varibles/env';

import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  http = inject(HttpClient)
  private authorization: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + environment.restApitoken
  })
  private itemsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["items"]' } })

  private projectsParams = new HttpParams({ fromObject: { sync_token: '*', resource_types: '["projects"]' } })

  refreshTrigger: Subject<void> = new Subject()

  //LABEL
  postLabel(data: SimpleLabel) {
    return this.http.post(labelsUrl, data, {
      headers: this.authorization
    })
  }
  getOneLabel(id: string): Observable<Label> {
    return this.http.get<Label>(labelsUrl + `/${id}`, { headers: this.authorization })
  }
  getAllLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(labelsUrl, { headers: this.authorization })
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
  deleteLabel(id: string): Observable<Object> {
    return this.http.delete(labelsUrl + `/${id}`, { headers: this.authorization })
  }
  //PROJECT
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
  getAllProjects(): Observable<SyncProjects> {
    return this.http.get<SyncProjects>(syncUrl,
      {
        headers: this.authorization,
        params: this.projectsParams
      })
  }
  postProject(data: Project) {
    return this.http.post(projectsUrl, data, {
      headers: this.authorization
    })
  }
  deleteProject(id: string) {
    return this.http.delete(projectsUrl + `/${id}`, { headers: this.authorization })

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
  //TASKS
  postTask(data: Task) {
    return this.http.post(tasksUrl, data, {
      headers: this.authorization
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

  editTask(data: EditTask) {
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