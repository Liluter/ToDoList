import { Component, DestroyRef, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoistApi, Task } from "@doist/todoist-api-typescript"
import { environment } from './env'
import { CommonModule } from '@angular/common';
import { Observable, from, tap, debounceTime, switchMap, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  clickEvent = new EventEmitter<void>()
  destroyRef = inject(DestroyRef)
  clickObservable$: Observable<void>
  tasks$!: Observable<Task[]>
  api: TodoistApi
  constructor() {
    this.api = new TodoistApi(environment.restApitoken)
    this.clickObservable$ = from(this.clickEvent)

  }

  ngOnInit() {
    this.clickObservable$.pipe(
      debounceTime(1000),
      switchMap(() => this.tasks$ = from(this.api.getTasks())),
      tap((data) => console.log(data)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe()
  }
  getTasks() {
    this.clickEvent.emit();
  }
}



