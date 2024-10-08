import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from "@angular/core";
import { AsyncPipe, DatePipe, JsonPipe, KeyValuePipe, NgClass } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { toSignal } from "@angular/core/rxjs-interop";
import { map, Subject, switchMap, tap } from "rxjs";

import { ApiCallsService } from "../../../services/api-calls.service";
import { ShowModalService, TaskStatus } from "../../../services/showModal.service";
import { ShowMessageService } from "../../../services/showMessage.service";

import { Tasks } from "../../../interfaces/tasks.interface";
import { Label } from "../../../interfaces/label.interface";

import { Message, MessageStatus } from "../../../types/message.interface";
import { FilterModel } from "../../../types/filter.interface";
import { SortBy, SortDir, ViewSize } from "../../../types/sortBy";

import { badgeClass, getLabelColor, getProjectColor } from "../../../utilities/utility";
import { SyncProject } from "../../../interfaces/syncProject.interface";



@Component({
  templateUrl: './uncompleted-page.component.html',
  standalone: true,
  styleUrl: './uncompleted-page.component.scss',
  imports: [AsyncPipe, NgClass, DatePipe, JsonPipe, RouterModule, FormsModule, KeyValuePipe, NgClass]
})
export class UncompletedPageComponent implements OnInit {
  badgeClass = badgeClass
  getLabelColor = getLabelColor
  getProjectColor = getProjectColor
  descriptionOpenHandler: string = '';
  modalService = inject(ShowModalService)
  api: ApiCallsService = inject(ApiCallsService)
  showMessageService: ShowMessageService = inject(ShowMessageService)
  refreshTriger$: Subject<void> = this.api.refreshTrigger
  modalShowSignal: Signal<boolean> = this.modalService.modalShowSignal
  modalDeleteShowSignal: Signal<boolean> = this.modalService.modalDeleteShowSignal
  messageModalSignal: Signal<string> = this.modalService.messageSignal
  checkBoxElementSignal: Signal<HTMLInputElement | null> = toSignal(this.modalService.checkBoxELement$, { initialValue: null })
  isSmall: WritableSignal<boolean> = signal(false)

  listSortBy = SortBy
  listSortDir = SortDir
  viewSizes = ViewSize
  allLabels: Signal<Label[]> = toSignal(this.api.getAllLabels(), { initialValue: [] })
  allProjects: Signal<[SyncProject] | null> = toSignal(this.api.getAllProjects().pipe(map(data => data.projects)), { initialValue: null })
  checksBoolArrayUncompleted: Signal<boolean[]> = toSignal(this.modalService.checkArrayUncompleted$, { initialValue: [] })
  tasksModeluncompleted: boolean[] = this.checksBoolArrayUncompleted()
  sortBy: WritableSignal<SortBy> = signal(SortBy.date)
  sortDir: WritableSignal<SortDir> = signal(SortDir.asc)
  actualViewSize: WritableSignal<ViewSize> = signal(ViewSize.big)

  uncompletedTasks: Signal<Tasks | null> = toSignal(this.refreshTriger$.pipe(switchMap(() => this.api.getUncompletedTasks().pipe(
    tap(data => {
      this.tasksModeluncompleted = data.items.map(() => false)
      this.modalService.initCheckArrayUncompleted(this.tasksModeluncompleted)
    }),
    map(data => { return { uncompleted: data.items, completed: null } }),
  ))), { initialValue: null })

  filterByTitle: WritableSignal<string> = signal('')
  filterByPriority: WritableSignal<string> = signal('')
  filterByLabel: WritableSignal<string> = signal('')
  filterByProject: WritableSignal<string> = signal('')

  filters: FilterModel[] = [{ filter: this.filterByTitle, name: 'title' },
  { filter: this.filterByPriority, name: 'priority' },
  { filter: this.filterByLabel, name: 'label' },
  { filter: this.filterByProject, name: 'project' }]

  sortedTasks: Signal<Tasks> = computed(() => {
    let tasks: Tasks = {
      uncompleted: this.uncompletedTasks()?.uncompleted,
      completed: this.uncompletedTasks()?.completed
    }
    if (this.filterByTitle().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.content.toLowerCase().includes(this.filterByTitle().trim().toLowerCase()))
    }
    if (this.filterByPriority().length === 1) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.priority === +this.filterByPriority())
    }
    if (this.filterByLabel().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => item.labels.some(el => el.toLowerCase().includes(this.filterByLabel().trim().toLowerCase())))
    }
    if (this.filterByProject().length > 0) {
      tasks.uncompleted = tasks.uncompleted?.filter(item => this.projectNameById(item.project_id)?.toLowerCase().includes(this.filterByProject().trim().toLowerCase()))
    }

    switch (this.sortBy()) {
      case SortBy.priority:
        return this.sortDir() === SortDir.asc ? {
          uncompleted: tasks.uncompleted?.sort((a, b) => a.priority - b.priority), completed: tasks?.completed
        } : {
          uncompleted: tasks.uncompleted?.sort((a, b) => b.priority - a.priority), completed: tasks?.completed
        }
      case SortBy.date:
        return this.sortDir() === SortDir.asc ? {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) return Date.parse(prim.due.date) - Date.parse(sec.due.date)
            else return 1
          }
          ), completed: tasks?.completed
        } : {
          uncompleted: tasks.uncompleted?.sort((prim, sec) => {
            if (prim.due && sec.due) return Date.parse(sec.due.date) - Date.parse(prim.due.date)
            else return 1
          }), completed: tasks?.completed
        }
      default:
        return tasks
    }
  })

  // windowSize = window.innerWidth

  ngOnInit(): void {
    this.refreshData()
  }

  openDescription(id: string) {
    if (this.descriptionOpenHandler === id) {
      this.descriptionOpenHandler = ''
      return
    }
    this.descriptionOpenHandler = id;
  }
  openModal(taskId: string, input: HTMLInputElement) {
    const lastIndexOf = input.id.lastIndexOf('-')
    const idx = +input.id.slice(lastIndexOf + 1)
    const newTasks = this.tasksModeluncompleted?.map((task, index) => index === idx ? true : false)
    if (input.checked && newTasks) {
      this.modalService.nextCheckUncompleted(newTasks)
      this.modalService.showModal(taskId, input)
    } else {
      this.modalService.closeModal(idx, false, TaskStatus.complete)
    }
  }
  openDeleteModal(id: string) {
    this.modalService.showDeleteModal(id)
  }

  closeModal() {
    const checkBoxElement = this.checkBoxElementSignal()
    if (checkBoxElement !== null) {
      const lastIndexOf = checkBoxElement.id.lastIndexOf('-')
      const idx = +checkBoxElement.id.slice(lastIndexOf + 1)
      this.modalService.closeModal(idx, false, TaskStatus.complete)
    }
  }
  closeDeleteModal() {
    this.modalService.closeDeleteModal()
  }
  completeTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.completeTask(taskId).subscribe(
      data => {
        const syncStatus = { ...data.sync_status }
        const response = Object.values(syncStatus)[0]
        if (response === "ok") {
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  completed successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        } else if (typeof response !== 'string') {
          this.showMessage({ type: MessageStatus.error, text: 'Error : ' + response.error_tag })
        }
      }, error => {
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: MessageStatus.error, text: message })
      }
    );
    this.closeModal()
  }
  refreshData() {
    this.refreshTriger$.next();
  }
  deleteTask() {
    const taskId: string = this.modalService.message.getValue()
    this.api.deleteTask(taskId).subscribe(
      data => {
        if (data) {
          this.showMessage({ type: MessageStatus.success, text: `Task "${taskId}"  deleted successfully` })
          this.modalService.closeDeleteModal()
          this.refreshData()
        }
      }, error => {
        let message = error.message
        if (error.status === 403 || error.status === 400) {
          message = error.error
        }
        this.showMessage({ type: MessageStatus.error, text: message })
      }
    )
  }
  showMessage(message: Message) {
    this.showMessageService.showMessage(message)
  }

  sortOption(sort: SortBy) {
    this.sortBy.set(sort)
  }
  sortDirection(sort: SortDir) {
    this.sortDir.set(sort)
  }
  projectNameById(id: string) {
    return this.allProjects()?.find(el => el.id === id)?.name
  }
  clearFilters() {
    this.filters.forEach(f => f.filter.set(''))
  }
  changeTaskSize(size: ViewSize) {
    this.actualViewSize.set(size)
  }
}