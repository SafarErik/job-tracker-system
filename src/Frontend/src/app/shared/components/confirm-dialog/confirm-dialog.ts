import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Spartan UI
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

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
  imports: [CommonModule, ...HlmAlertDialogImports],
  templateUrl: './confirm-dialog.html',
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
  isDestructive = true; // Controls button variant

  /**
   * Promise resolver for async confirmation
   */
  private resolver?: (value: boolean) => void;

  /**
   * Reference to dialog element for focus management
   */
  @ViewChild('dialogElement') dialogElement?: ElementRef;

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
    // Resolve previous promise if exists
    if (this.resolver) {
      this.resolver(false);
      this.resolver = undefined;
    }

    this.title = config.title;
    this.message = config.message;
    this.confirmText = config.confirmText || 'OK';
    this.cancelText = config.cancelText || 'Cancel';
    this.isDestructive = config.isDangerous ?? true;
    this.isVisible = true;

    // Focus dialog after it renders
    setTimeout(() => {
      this.dialogElement?.nativeElement.focus();
    }, 0);

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
    this.resolver = undefined;
  }

  /**
   * User cancelled the action
   */
  cancel(): void {
    this.isVisible = false;
    this.resolver?.(false);
    this.resolver = undefined;
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
