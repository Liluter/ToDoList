import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Message } from "../types/message.interface";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  private message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')

  modalShow$ = this.modalShow.asObservable();
  message$ = this.message.asObservable();
  type$ = this.type.asObservable()

  showModal(message: Message): void {
    this.message.next(message.text)
    this.type.next(message.type)
    this.modalShow.next(true)
    setTimeout(() => this.modalShow.next(false), 6000)
  }
}

