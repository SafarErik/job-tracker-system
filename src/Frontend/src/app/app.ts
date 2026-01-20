import { Component, signal, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog';
import { NotificationService } from './services/notification';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastNotificationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('job-tracker-client');

  @ViewChild(ConfirmDialogComponent) confirmDialog?: ConfirmDialogComponent;

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * After view initializes, connect the confirm dialog to the notification service
   */
  ngAfterViewInit(): void {
    if (this.confirmDialog) {
      this.notificationService.confirmDialog = this.confirmDialog;
    }
  }
}
