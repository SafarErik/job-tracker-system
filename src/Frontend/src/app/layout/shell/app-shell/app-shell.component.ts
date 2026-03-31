import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GlobalHeaderComponent } from '../global-header/global-header.component';
import { ProfileSettingsSheetComponent } from '../../../features/profile/components/profile-settings-sheet/profile-settings-sheet.component';
import { ProfileStore } from '../../../features/profile/services/profile.store';
import { AiDrawerComponent } from '../../../shared/components/ai-drawer/ai-drawer.component';

@Component({
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    GlobalHeaderComponent,
    HlmSidebarImports,
    ProfileSettingsSheetComponent,
    AiDrawerComponent,
  ],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  private profileStore = inject(ProfileStore);

  ngOnInit() {
    this.profileStore.loadProfile();
  }
}
