import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Message } from "../types/message.interface";



@Injectable({ providedIn: 'root' })
export class ShowMessageService {
  private notification = new BehaviorSubject<boolean>(false)
  private message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')

  notification$ = this.notification.asObservable();
  message$ = this.message.asObservable();
  type$ = this.type.asObservable()

  showMessage(message: Message): void {
    this.message.next(message.text)
    this.type.next(message.type)
    this.notification.next(true)
    setTimeout(() => this.notification.next(false), 4000)
  }
}

