import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Spartan UI
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

// Icons
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideInfo,
  lucideTrash2,
  lucideAlertCircle
} from '@ng-icons/lucide';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmButtonImports,
    NgIcon
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideInfo,
      lucideTrash2,
      lucideAlertCircle
    })
  ],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialogComponent {
  isVisible = false;
  title = 'Confirm Action';
  message = 'Are you sure you want to proceed?';
  confirmText = 'OK';
  cancelText = 'Cancel';
  isDestructive = true;

  private resolver?: (value: boolean) => void;

  constructor(private cdr: ChangeDetectorRef) { }

  show(config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
  }): Promise<boolean> {
    if (this.resolver) {
      const oldResolver = this.resolver;
      this.resolver = undefined;
      oldResolver(false);
    }

    this.title = config.title;
    this.message = config.message;
    this.confirmText = config.confirmText || 'OK';
    this.cancelText = config.cancelText || 'Cancel';
    this.isDestructive = config.isDangerous ?? true;

    this.isVisible = true;
    this.cdr.detectChanges();

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm(ctx?: any): void {
    const resolve = this.resolver;
    this.resolver = undefined;
    this.isVisible = false;

    if (ctx) ctx.close();
    this.cdr.detectChanges();

    if (resolve) resolve(true);
  }

  cancel(ctx?: any): void {
    const resolve = this.resolver;
    this.resolver = undefined;
    this.isVisible = false;

    if (ctx) ctx.close();
    this.cdr.detectChanges();

    if (resolve) resolve(false);
  }

  onDialogClosed(): void {
    if (this.resolver) {
      this.cancel();
    }
  }
}
