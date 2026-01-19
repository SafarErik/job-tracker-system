import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ConfirmDialog Component
 *
 * A custom confirmation dialog with better UX than browser's confirm()
 *
 * Features:
 * - Modern, beautiful design
 * - Customizable title, message, and button text
 * - Keyboard support (Enter = confirm, Escape = cancel)
 * - Backdrop click to cancel
 * - Smooth animations
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  /**
   * Dialog visibility state
   */
  isVisible = false;

  /**
   * Dialog configuration
   */
  title = 'Confirm Action';
  message = 'Are you sure you want to proceed?';
  confirmText = 'OK';
  cancelText = 'Cancel';
  confirmButtonClass = 'btn-danger'; // 'btn-danger' or 'btn-primary'

  /**
   * Promise resolver for async confirmation
   */
  private resolver?: (value: boolean) => void;

  /**
   * Show the confirmation dialog
   * Returns a promise that resolves to true if confirmed, false if cancelled
   */
  show(config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
  }): Promise<boolean> {
    this.title = config.title;
    this.message = config.message;
    this.confirmText = config.confirmText || 'OK';
    this.cancelText = config.cancelText || 'Cancel';
    this.confirmButtonClass = config.isDangerous ? 'btn-danger' : 'btn-primary';
    this.isVisible = true;

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  /**
   * User confirmed the action
   */
  confirm(): void {
    this.isVisible = false;
    this.resolver?.(true);
  }

  /**
   * User cancelled the action
   */
  cancel(): void {
    this.isVisible = false;
    this.resolver?.(false);
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  /**
   * Handle keyboard events
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirm();
    } else if (event.key === 'Escape') {
      this.cancel();
    }
  }
}
