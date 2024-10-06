import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject } from "rxjs";

export enum TaskStatus {
  complete = 'complete',
  uncomplete = 'uncomplete'
}

@Injectable({ providedIn: 'root' })
export class ShowModalService {

  private modalShow = new BehaviorSubject<boolean>(false)
  private modalDeleteShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private taskStatusHandler = new BehaviorSubject<string>('')
  private checkBoxElement = new BehaviorSubject<HTMLInputElement | null>(null)
  checkArrayUncompleted = new BehaviorSubject<boolean[]>([])
  checkArrayCompleted = new BehaviorSubject<boolean[]>([])

  modalShow$ = this.modalShow.asObservable();
  modalDeleteShow$ = this.modalDeleteShow.asObservable();
  checkBoxELement$ = this.checkBoxElement.asObservable();
  message$ = this.message.asObservable();

  modalShowSignal = toSignal(this.modalShow);
  modalDeleteShowSignal = toSignal(this.modalDeleteShow)
  messageSignal = toSignal(this.message);
  taskStatusHandler$ = this.taskStatusHandler.asObservable()
  taskStatusHandlerSignal = toSignal(this.taskStatusHandler)
  checkArrayUncompleted$ = this.checkArrayUncompleted.asObservable();
  checkArrayCompleted$ = this.checkArrayCompleted.asObservable();

  showModal(id: string, input: HTMLInputElement | null, status?: TaskStatus): void {
    this.checkBoxElement.next(input)
    this.message.next(id)
    this.modalShow.next(true)
    if (status) {
      this.taskStatusHandler.next(status)
    }
  }
  showDeleteModal(message: string) {
    this.message.next(message)
    this.modalDeleteShow.next(true)
  }
  initCheckArrayUncompleted(array: boolean[]) {
    this.checkArrayUncompleted.next(array)
  }
  initCheckArrayCompleted(array: boolean[]) {
    this.checkArrayCompleted.next(array)
  }
  nextCheckUncompleted(array: boolean[]) {
    this.checkArrayUncompleted.next(array)
  }
  nextCheckCompleted(array: boolean[]) {
    this.checkArrayCompleted.next(array)
  }
  closeModal(idx: number, check: boolean, status: TaskStatus): void {
    this.modalShow.next(false)
    if (status) {
      if (status === TaskStatus.complete) {
        if ((idx !== undefined) && (check !== undefined)) {

          if (idx >= 0) {
            let arr = this.checkArrayUncompleted.getValue()
            arr[idx] = check
            this.checkArrayUncompleted.next(arr)
          }
        }
      }
      if (status === TaskStatus.uncomplete) {
        if ((idx !== undefined) && (check !== undefined)) {

          if (idx >= 0) {
            let arr = this.checkArrayCompleted.getValue()
            arr[idx] = check
            this.checkArrayCompleted.next(arr)
          }
        }
      }
    }
  }
  closeDeleteModal() {
    this.modalDeleteShow.next(false)
  }
}

