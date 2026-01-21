/**
 * ============================================================================
 * CLICK OUTSIDE DIRECTIVE
 * ============================================================================
 *
 * A directive that emits an event when the user clicks outside of the host element.
 * Commonly used for closing dropdowns, modals, and menus when clicking elsewhere.
 *
 * (Egy direktíva, ami eseményt bocsát ki, amikor a felhasználó a host elemen
 * kívülre kattint. Gyakran használják dropdown-ok, modálok és menük bezárásához.)
 *
 * Usage / Használat:
 * <div (clickOutside)="handleClickOutside()">
 *   Dropdown content...
 * </div>
 */

import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  /**
   * Event emitter that fires when a click occurs outside the host element
   * (Eseménykibocsátó, ami akkor aktiválódik, amikor a host elemen kívül történik kattintás)
   */
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  /**
   * Listen for document-level click events
   * (Figyeli a dokumentum szintű kattintás eseményeket)
   *
   * The event listener is attached to the document to capture all clicks.
   * If the click target is not contained within the host element, emit the event.
   *
   * @param event - The mouse event containing the target element
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Safety check for null target
    if (!target) {
      return;
    }

    // Check if the click was inside or outside the host element
    // (Ellenőrzi, hogy a kattintás a host elemen belül vagy kívül történt-e)
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      // Emit the event if clicked outside
      // (Bocsássa ki az eseményt, ha kívülre kattintottak)
      this.clickOutside.emit();
    }
  }
}
