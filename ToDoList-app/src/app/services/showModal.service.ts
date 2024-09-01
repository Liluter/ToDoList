import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  private modalDeleteShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')
  private target = new BehaviorSubject<HTMLInputElement | null>(null)
  checkArray = new BehaviorSubject<boolean[]>([])
  modalShow$ = this.modalShow.asObservable();
  modalDeleteShow$ = this.modalDeleteShow.asObservable();
  message$ = this.message.asObservable();
  target$ = this.target.asObservable();
  type$ = this.type.asObservable()
  checkArray$ = this.checkArray.asObservable();
  showModal(message: string, input: HTMLInputElement): void {
    this.target.next(input)
    this.message.next(message)
    this.modalShow.next(true)
  }
  showDeleteModal(message: string) {
    this.message.next(message)
    this.modalDeleteShow.next(true)
  }
  initCheckArray(array: boolean[]) {
    this.checkArray.next(array)
  }
  nextCheck(array: boolean[]) {
    this.checkArray.next(array)
  }
  closeModal(idx?: number, check?: boolean): void {
    this.modalShow.next(false)
    if ((idx !== undefined) && (check !== undefined)) {

      if (idx >= 0) {
        let arr = this.checkArray.getValue()
        arr[idx] = check
        this.checkArray.next(arr)
      }
    }
  }
  closeDeleteModal() {
    this.modalDeleteShow.next(false)
  }
}

