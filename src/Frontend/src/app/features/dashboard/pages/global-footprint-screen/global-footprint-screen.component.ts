import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyStore } from '../../../companies/services/company.store';
import { JobApplicationStore } from '../../../job-applications/services/job-application.store';
import { GlobalFootprintComponent } from '../../components/global-footprint/global-footprint.component';
import { buildFootprintLocations } from '../../data/footprint-locations';

@Component({
  selector: 'app-global-footprint-screen',
  imports: [CommonModule, GlobalFootprintComponent],
  templateUrl: './global-footprint-screen.component.html',
  styleUrl: './global-footprint-screen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalFootprintScreenComponent implements OnInit {
  private readonly applicationStore = inject(JobApplicationStore);
  private readonly companyStore = inject(CompanyStore);

  readonly isLoading = computed(
    () => this.applicationStore.isLoading() || this.companyStore.isLoading(),
  );

  readonly footprintLocations = computed(() =>
    buildFootprintLocations(this.applicationStore.applications(), this.companyStore.companies()),
  );

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }
}
