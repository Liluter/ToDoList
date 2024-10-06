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
  checkArray = new BehaviorSubject<boolean[]>([])
  checkArray2 = new BehaviorSubject<boolean[]>([])

  modalShow$ = this.modalShow.asObservable();
  modalDeleteShow$ = this.modalDeleteShow.asObservable();
  checkBoxELement$ = this.checkBoxElement.asObservable();
  message$ = this.message.asObservable();

  modalShowSignal = toSignal(this.modalShow);
  modalDeleteShowSignal = toSignal(this.modalDeleteShow)
  messageSignal = toSignal(this.message);
  taskStatusHandler$ = this.taskStatusHandler.asObservable()

  checkArray$ = this.checkArray.asObservable();

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
  initCheckArray(array: boolean[]) {
    this.checkArray.next(array)
  }
  initCheckArray2(array: boolean[]) {
    this.checkArray2.next(array)
  }
  nextCheck(array: boolean[]) {
    this.checkArray.next(array)
  }
  nextCheck2(array: boolean[]) {
    this.checkArray2.next(array)
  }
  closeModal(idx?: number, check?: boolean, status?: TaskStatus): void {
    this.modalShow.next(false)
    if (status) {
      if (status === TaskStatus.complete) {
        if ((idx !== undefined) && (check !== undefined)) {

          if (idx >= 0) {
            let arr = this.checkArray.getValue()
            arr[idx] = check
            this.checkArray.next(arr)
          }
        }
      }
      if (status === TaskStatus.uncomplete) {
        if ((idx !== undefined) && (check !== undefined)) {

          if (idx >= 0) {
            let arr = this.checkArray2.getValue()
            arr[idx] = check
            this.checkArray2.next(arr)
          }
        }
      }
    } else {
      if ((idx !== undefined) && (check !== undefined)) {

        if (idx >= 0) {
          let arr = this.checkArray.getValue()
          arr[idx] = check
          this.checkArray.next(arr)
        }
      }

    }
  }
  closeDeleteModal() {
    this.modalDeleteShow.next(false)
  }
}

