import { AsyncPipe, DatePipe, JsonPipe, NgClass } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { badgeClass, getLabelColor, getProjectColor } from "../../utilities/utility";
import { ApiCallsService } from "../../services/api-calls.service";
import { map, Observable, tap } from "rxjs";
import { Item } from "../../interfaces/item.interface";
import { Label } from "../../interfaces/label.interface";
import { SyncProject } from "../../interfaces/syncProject.interface";
import { FormsModule, NgForm } from "@angular/forms";
import { EditData } from "../../interfaces/editData.interface";
import { Message } from "../../types/message.interface";
import { ShowMessageService } from "../../services/showMessage.service";

@Component({
  templateUrl: './edit.component.html',
  standalone: true,
  styleUrl: './edit.component.scss',
  imports: [AsyncPipe, JsonPipe, NgClass, DatePipe, RouterModule, FormsModule]
})
export class EditComponent {

  model: Item = {
    content: 'test',
    description: 'test',
    added_at: '',
    added_by_uid: '',
    assigned_by_uid: '',
    checked: false,
    child_order: 0,
    collapsed: false,
    completed_at: '',
    day_order: 0,
    due: {
      date: '',
      is_recurring: false,
      lang: "en",
      string: "9 Jun",
      timezone: null
    },
    duration: 0,
    id: '',
    is_deleted: false,
    labels: [''],
    parent_id: '',
    priority: 1,
    project_id: '',
    responsible_uid: '',
    section_id: '',
    sync_id: '',
    updated_at: '',
    user_id: '',
    v2_id: '',
    v2_parent_id: '',
    v2_project_id: '',
    v2_section_id: ''
  }
  apiService: ApiCallsService = inject(ApiCallsService)
  @Input() id!: string

  getProjectColor = getProjectColor
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  loadingState: boolean = false
  task$?: Observable<Item>
  descriptionOpenHandler: string | undefined;
  allLabels$: Observable<Label[]> = this.apiService.getAllLabels()
  projectId?: string
  project$?: Observable<SyncProject>;
  projects?: SyncProject[]
  allProjects$: Observable<SyncProject[]> = this.apiService.getAllProjects().pipe(map(data => data.projects))
  showMessageService: ShowMessageService = inject(ShowMessageService)
  router: Router = inject(Router)
  ngOnInit() {
    if (this.id) {
      this.task$ = this.apiService.getTaskById(this.id).pipe(
        tap(data => {
          this.getProject(data.item.project_id);
          this.model = data.item
          console.dir(this.model)
        }),
        map(data => data.item)
      )
    }
  }
  openDescription(id: string | undefined) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  getProject(id: string) {
    this.project$ = this.apiService.getProjectById(id).pipe(
      map(data => data.project)
    )
  }
  saveData(form: NgForm) {
    console.log(form.value,);
    console.log(this.model)
    const taskEdited: EditData = {
      id: this.model.id,
      content: this.model.content,
      description: this.model.description,
      due: this.model.due,
      labels: [...this.model.labels],
      priority: this.model.priority
    }
    this.apiService.editTask(taskEdited).subscribe(data => {
      if (data) {
        this.loadingState = false
        this.showMessage({ type: 'success', text: `Task "${form.form.controls['title'].value}"  added successfully` })
        this.router.navigate([`/detail/${this.id}`])
      }
    }, error => {
      this.loadingState = false
      let message = error.message
      if (error.status === 403 || error.status === 400) {
        message = error.error
      }
      this.showMessage({ type: 'error', text: message })
    })

  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }
}