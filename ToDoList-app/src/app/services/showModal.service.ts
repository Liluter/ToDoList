import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')
  private target = new BehaviorSubject<HTMLInputElement | null>(null)
  checkArray = new BehaviorSubject<boolean[]>([])
  modalShow$ = this.modalShow.asObservable();
  message$ = this.message.asObservable();
  target$ = this.target.asObservable();
  type$ = this.type.asObservable()
  checkArray$ = this.checkArray.asObservable();
  showModal(message: string, input: HTMLInputElement): void {
    this.target.next(input)
    this.message.next(message)
    this.modalShow.next(true)
  }
  initCheckArray(array: boolean[]) {
    this.checkArray.next(array)
  }
  nextCheck(array: boolean[]) {
    this.checkArray.next(array)
  }
  closeModal(idx: number, check: boolean): void {
    this.modalShow.next(false)
    // this.target.getValue()!.checked = false
    if (idx >= 0) {
      let arr = this.checkArray.getValue()
      arr[idx] = check
      this.checkArray.next(arr)
    }
  }
}

