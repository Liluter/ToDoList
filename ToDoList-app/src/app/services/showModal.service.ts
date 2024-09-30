import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject } from "rxjs";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  private modalDeleteShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')
  private target = new BehaviorSubject<HTMLInputElement | null>(null)
  checkArray = new BehaviorSubject<boolean[]>([])
  checkArray2 = new BehaviorSubject<boolean[]>([])
  modalShow$ = this.modalShow.asObservable();
  modalShowSignal = toSignal(this.modalShow)
  modalDeleteShow$ = this.modalDeleteShow.asObservable();
  modalDeleteShowSignal = toSignal(this.modalDeleteShow)
  message$ = this.message.asObservable();
  messageSignal = toSignal(this.message);
  target$ = this.target.asObservable();
  type$ = this.type.asObservable()
  checkArray$ = this.checkArray.asObservable();
  showModal(message: string, input: HTMLInputElement, action?: 'complete' | 'uncomplete'): void {
    this.target.next(input)
    this.message.next(message)
    this.modalShow.next(true)
    if (action) {
      this.type.next(action)
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
  closeModal(idx?: number, check?: boolean, action?: 'complete' | 'uncomplete'): void {
    this.modalShow.next(false)
    console.log(this.checkArray.getValue())
    console.log(this.checkArray2.getValue())
    console.log('action: ', action)
    if (action) {
      if (action === 'complete') {
        if ((idx !== undefined) && (check !== undefined)) {

          if (idx >= 0) {
            let arr = this.checkArray.getValue()
            arr[idx] = check
            this.checkArray.next(arr)
          }
        }
      }
      if (action === 'uncomplete') {
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

