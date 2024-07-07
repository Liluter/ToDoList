import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Label } from './interfaces/label.interface';
import { environment } from './varibles/env';
import { Observable } from 'rxjs';
import { labelsUrl } from './varibles/urls';
@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  private authorization: HttpHeaders = new HttpHeaders({
    'Authorization': 'Bearer ' + environment.restApitoken
  })
  constructor(private readonly http: HttpClient) { }

  getAllLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(labelsUrl, { headers: this.authorization })
  }
}
// this.allLabels$ = this.http.get<Label[]>('https://api.todoist.com/rest/v2/labels', {
//       headers: { 'Authorization': 'Bearer ' + environment.restApitoken }
//     }).pipe(
//       tap(data => this.labels = data),
//     )