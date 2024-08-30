import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { ApiCallsService } from "../../../services/api-calls.service";
import { map, Observable, tap } from "rxjs";
import { Tasks } from "../../../interfaces/tasks.interface";
import { badgeClass, getLabelColor } from "../../../utilities/utility";
import { Label } from "../../../interfaces/label.interface";
import { SyncProject } from "../../../interfaces/syncProject.interface";
import { RouterModule } from "@angular/router";
import { ShowModalService } from "../../../services/showModal.service";
import { FormsModule } from "@angular/forms";
@Component({
  templateUrl: './uncompleted-page.component.html',
  standalone: true,
  styleUrl: './uncompleted-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule]
})
export class UncompletedPageComponent implements OnInit {
  destroyRef = inject(DestroyRef)
  uncompletedTasks$: Observable<Tasks>;
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  descriptionOpenHandler?: string;
  labels?: Label[]
  allLabels$?: Observable<Label[]>;
  allProjects$?: Observable<[SyncProject]>;
  menuObservable$: any;
  tasks: boolean[] = []
  modalService = inject(ShowModalService)
  modalShow$: Observable<boolean> = this.modalService.modalShow$
  messageModal$: Observable<string> = this.modalService.message$
  target$: Observable<EventTarget | null> = this.modalService.target$
  openModalBool: boolean = false
  target!: EventTarget | null
  constructor(private readonly api: ApiCallsService) {
    this.allLabels$ = this.api.getAllLabels()
    this.uncompletedTasks$ = this.api.getUncompletedTasks().pipe(
      tap(data => {
        this.tasks = data.items.map(item => false)
      }),
      map(data => { return { uncompleted: data.items, completed: null } }),
    )

  }
  ngOnInit(): void {
    this.target$.subscribe(data => this.target = data)
  }
  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  openModal(id: string, input: HTMLInputElement) {
    console.log('Id', id)
    console.log('input', input)

    if (input.checked) {
      this.modalService.showModal(id, input)
    } else {
      this.modalService.closeModal()
    }
  }


  closeModal() {
    this.modalService.closeModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    console.log('Send task id :', taskId, 'to service for completion process');
    this.api.completeTask(taskId);
    this.modalService.closeModal()
  }
}