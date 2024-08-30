import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Message } from "../types/message.interface";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')

  modalShow$ = this.modalShow.asObservable();
  message$ = this.message.asObservable();
  type$ = this.type.asObservable()

  showModal(message: string, input: HTMLInputElement): void {
    this.message.next(message)
    // this.type.next(message.type)
    this.modalShow.next(true)
    setTimeout(() => {
      this.modalShow.next(false);
      input.checked = false
    }, 6000)
  }
  closeModal(input?: HTMLInputElement): void {
    this.modalShow.next(false)
    if (input) {
      input.checked = false
    }
  }
}

