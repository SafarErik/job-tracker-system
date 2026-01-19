import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Services
import { ApplicationService } from '../../services/application';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

/**
 * JobList Component
 *
 * This component displays all job applications in a responsive card grid.
 *
 * Key Angular Concepts Used:
 * 1. OnInit lifecycle hook - runs after component initialization
 * 2. Dependency Injection - ApplicationService is injected via constructor
 * 3. Observables - async data streams from HTTP requests
 * 4. Two-way data flow - TypeScript class <-> HTML template
 */
@Component({
  selector: 'app-job-list',
  standalone: true, // New Angular feature: no need for NgModule
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes, etc.
    RouterLink, // Enables [routerLink] directive
  ],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css',
})
export class JobList implements OnInit {
  // ============================================
  // Component State (Data that changes over time)
  // ============================================

  /**
   * Array to hold all job applications from the backend
   * Initially empty, populated after API call
   */
  applications: JobApplication[] = [];

  /**
   * Loading state indicator
   * true = data is being fetched, false = data loaded or error occurred
   * Used to show/hide loading spinner
   */
  isLoading = false;

  /**
   * Error message storage
   * null = no error, string = error occurred
   */
  errorMessage: string | null = null;

  // ============================================
  // Enum for HTML Template Access
  // ============================================

  /**
   * Make the enum available to the HTML template
   * This allows us to use JobApplicationStatus.Applied in the template
   */
  Status = JobApplicationStatus;

  // ============================================
  // Constructor - Dependency Injection
  // ============================================

  /**
   * Angular's Dependency Injection automatically provides the ApplicationService
   * We declare it as 'private' so it's only accessible within this class
   * 'readonly' ensures we don't accidentally reassign the service
   */
  constructor(private readonly applicationService: ApplicationService) {}

  // ============================================
  // Lifecycle Hooks
  // ============================================

  /**
   * ngOnInit - Angular lifecycle hook
   * Runs ONCE after the component is created and properties are initialized
   * Perfect place for initial data loading
   *
   * Why not use constructor?
   * - Constructor should only handle dependency injection
   * - ngOnInit is called after all inputs are set and the component is ready
   */
  ngOnInit(): void {
    this.loadApplications();
  }

  // ============================================
  // Methods (Functions that perform actions)
  // ============================================

  /**
   * Load all job applications from the backend
   *
   * Key Concepts:
   * 1. Observable - represents a stream of data that will arrive in the future
   * 2. subscribe() - tells the Observable "I'm interested in your data"
   * 3. next - callback when data arrives successfully
   * 4. error - callback when something goes wrong
   */
  loadApplications(): void {
    this.isLoading = true; // Show loading spinner
    this.errorMessage = null; // Clear any previous errors

    // Call the service method that returns an Observable
    this.applicationService.getApplications().subscribe({
      // Success callback - runs when HTTP request succeeds
      next: (data: JobApplication[]) => {
        this.applications = data; // Store the received data
        this.isLoading = false; // Hide loading spinner
      },

      // Error callback - runs when HTTP request fails
      error: (err) => {
        console.error('Failed to load applications:', err);
        this.errorMessage = 'Failed to load job applications. Please try again.';
        this.isLoading = false; // Hide loading spinner even on error
      },
    });
  }

  /**
   * Delete a job application
   *
   * @param id - The unique identifier of the application to delete
   *
   * Best Practice: Always confirm before deleting!
   */
  deleteApplication(id: number): void {
    // Native browser confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this application?');

    if (!confirmed) {
      return; // User cancelled, do nothing
    }

    // Call the delete endpoint
    this.applicationService.deleteApplication(id).subscribe({
      next: () => {
        // Success: Remove the deleted item from the local array
        // This updates the UI without reloading all data
        this.applications = this.applications.filter((app) => app.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete application:', err);
        alert('Failed to delete the application. Please try again.');
      },
    });
  }

  /**
   * Get CSS class for status badge based on application status
   *
   * @param status - The application status enum value
   * @returns CSS class string for styling the badge
   *
   * This is a helper method to make the HTML cleaner
   */
  getStatusClass(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'bg-blue-100 text-blue-800';
      case JobApplicationStatus.PhoneScreen:
        return 'bg-purple-100 text-purple-800';
      case JobApplicationStatus.TechnicalTask:
        return 'bg-yellow-100 text-yellow-800';
      case JobApplicationStatus.Interviewing:
        return 'bg-indigo-100 text-indigo-800';
      case JobApplicationStatus.Offer:
        return 'bg-green-100 text-green-800';
      case JobApplicationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case JobApplicationStatus.Ghosted:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get human-readable status label
   *
   * @param status - The application status enum value
   * @returns User-friendly status text
   */
  getStatusLabel(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'Applied';
      case JobApplicationStatus.PhoneScreen:
        return 'Phone Screen';
      case JobApplicationStatus.TechnicalTask:
        return 'Technical Task';
      case JobApplicationStatus.Interviewing:
        return 'Interviewing';
      case JobApplicationStatus.Offer:
        return 'Offer Received';
      case JobApplicationStatus.Rejected:
        return 'Rejected';
      case JobApplicationStatus.Ghosted:
        return 'Ghosted';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format date string to human-readable format
   *
   * @param dateString - ISO date string from backend (e.g., "2026-01-15T10:30:00Z")
   * @returns Formatted date string (e.g., "Jan 15, 2026")
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
