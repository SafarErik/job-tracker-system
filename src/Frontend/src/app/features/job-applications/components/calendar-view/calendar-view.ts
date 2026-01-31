import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * Calendar Day Interface
 * Represents a single day in the calendar with its applications
 */
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  applications: JobApplication[];
}

/**
 * Calendar View Component
 *
 * Displays job applications in a monthly calendar view.
 * Shows when applications were submitted and allows clicking for details.
 *
 * Key Features:
 * - Monthly calendar grid
 * - Application indicators on dates
 * - Click to view application details
 * - Navigation between months
 * - Responsive design
 */
@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, ...HlmButtonImports, ...HlmCardImports],
  templateUrl: './calendar-view.html',
})
export class CalendarViewComponent implements OnChanges {
  /**
   * Input: All job applications to display
   */
  @Input() applications: JobApplication[] = [];

  /**
   * Current month being displayed
   */
  currentDate = new Date();

  /**
   * Calendar days for the current view (including previous/next month overflow)
   */
  calendarDays: CalendarDay[] = [];

  /**
   * Days of the week headers
   */
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /**
   * Selected day for detail view
   */
  selectedDay: CalendarDay | null = null;

  /**
   * Status enum for template access
   */
  Status = JobApplicationStatus;

  /**
   * React to input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['applications']) {
      this.generateCalendar();
    }
  }

  /**
   * Generate calendar grid for the current month
   */
  private generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start calendar from Sunday before or on the 1st
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End calendar on Saturday after or on the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // Generate all days
    this.calendarDays = [];
    const currentDateIter = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateIter <= endDate) {
      const dateStr = this.formatDateForComparison(currentDateIter);
      const dayApplications = this.applications.filter((app) => {
        const appDate = this.formatDateForComparison(new Date(app.appliedAt));
        return appDate === dateStr;
      });

      this.calendarDays.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        isToday: currentDateIter.getTime() === today.getTime(),
        applications: dayApplications,
      });

      currentDateIter.setUTCDate(currentDateIter.getUTCDate() + 1);
    }
  }

  /**
   * Format date for comparison (YYYY-MM-DD)
   */
  private formatDateForComparison(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    this.selectedDay = null;
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    this.selectedDay = null;
  }

  /**
   * Navigate to current month
   */
  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.selectedDay = null;
  }

  /**
   * Get month and year string for header
   */
  getMonthYearString(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Handle day click
   */
  onDayClick(day: CalendarDay): void {
    if (day.applications.length > 0) {
      this.selectedDay = day;
    }
  }

  /**
   * Close detail modal
   */
  closeDetail(): void {
    this.selectedDay = null;
  }

  /**
   * Get status badge color (for badges with text)
   */
  getStatusColor(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'bg-info/10 text-info';
      case JobApplicationStatus.PhoneScreen:
        return 'bg-info/10 text-info';
      case JobApplicationStatus.TechnicalTask:
        return 'bg-warning/10 text-warning';
      case JobApplicationStatus.Interviewing:
        return 'bg-primary/10 text-primary';
      case JobApplicationStatus.Offer:
        return 'bg-success/10 text-success';
      case JobApplicationStatus.Accepted:
        return 'bg-success/10 text-success';
      case JobApplicationStatus.Rejected:
        return 'bg-destructive/10 text-destructive';
      case JobApplicationStatus.Ghosted:
        return 'bg-muted-foreground/10 text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  /**
   * Get status dot color (for calendar indicators)
   */
  getStatusDotColor(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'bg-info';
      case JobApplicationStatus.PhoneScreen:
        return 'bg-info/80';
      case JobApplicationStatus.TechnicalTask:
        return 'bg-warning/80';
      case JobApplicationStatus.Interviewing:
        return 'bg-primary';
      case JobApplicationStatus.Offer:
        return 'bg-success';
      case JobApplicationStatus.Accepted:
        return 'bg-success';
      case JobApplicationStatus.Rejected:
        return 'bg-destructive';
      case JobApplicationStatus.Ghosted:
        return 'bg-muted-foreground';
      default:
        return 'bg-muted';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: JobApplicationStatus): string {
    return JobApplicationStatus[status];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Get application count color indicator
   */
  getCountIndicatorColor(count: number): string {
    if (count === 0) return '';
    if (count === 1) return 'bg-info';
    if (count === 2) return 'bg-primary';
    return 'bg-destructive';
  }
}
