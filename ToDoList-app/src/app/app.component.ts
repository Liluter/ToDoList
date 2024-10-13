import { Component, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShowMessageService } from './services/showMessage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentDate: string = new Date().toISOString()
  service = inject(ShowMessageService)
  notificationSignal: Signal<boolean> = this.service.notificationSignal
  messageSignal: Signal<string> = this.service.messageSignal
  typweSignal: Signal<string> = this.service.typeSignal
}