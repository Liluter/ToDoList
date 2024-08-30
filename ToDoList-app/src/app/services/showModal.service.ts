import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, tap } from "rxjs";
import { Message } from "../types/message.interface";



@Injectable({ providedIn: 'root' })
export class ShowModalService {
  private modalShow = new BehaviorSubject<boolean>(false)
  public message = new BehaviorSubject<string>('')
  private type = new BehaviorSubject<string>('')
  private target = new BehaviorSubject<HTMLInputElement | null>(null)
  modalShow$ = this.modalShow.asObservable();
  message$ = this.message.asObservable();
  target$ = this.target.asObservable();
  type$ = this.type.asObservable()

  showModal(message: string, input: HTMLInputElement): void {
    this.target.next(input)
    this.message.next(message)
    this.modalShow.next(true)
  }
  closeModal(): void {
    this.modalShow.next(false)
    this.target.getValue()!.checked = false
  }
}

