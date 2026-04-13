import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideCheck,
  lucideCopy,
  lucideDownload,
  lucideFileText,
  lucideInfo,
  lucideLoader2,
  lucideLock,
  lucideMail,
  lucidePencilLine,
  lucideRefreshCw,
  lucideRotateCcw,
  lucideSparkles,
  lucideWand2,
} from '@ng-icons/lucide';
import { JobApplicationStore } from '../../../services/job-application.store';
import { DocumentStore } from '../../../../documents/services/document.store';
import { ProfileStore } from '../../../../profile/services/profile.store';
import { NotificationService } from '../../../../../core/services/notification.service';

export type DocumentDraftMode = 'resume' | 'coverLetter';

export interface DocumentDraft {
  applicationId: string;
  mode: DocumentDraftMode;
  content: string;
  sourceContent: string;
  isDirty: boolean;
  generatedAt?: string;
}

export interface DocumentGuideAction {
  id: string;
  labelKey: string;
  descriptionKey: string;
  mode: DocumentDraftMode | 'both';
  action: 'select' | 'regenerate';
}

export interface CvBlockEditResponse {
  chat: string;
  updated_json: unknown;
}

type DraftState = Record<DocumentDraftMode, DocumentDraft | null>;

@Component({
  selector: 'app-assets-view',
  imports: [CommonModule, TranslocoPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCheck,
      lucideCopy,
      lucideDownload,
      lucideFileText,
      lucideInfo,
      lucideLoader2,
      lucideLock,
      lucideMail,
      lucidePencilLine,
      lucideRefreshCw,
      lucideRotateCcw,
      lucideSparkles,
      lucideWand2,
    }),
  ],
  templateUrl: './assets-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsViewComponent implements OnInit {
  public readonly store = inject(JobApplicationStore);
  public readonly documentStore = inject(DocumentStore);
  public readonly profileStore = inject(ProfileStore);
  private readonly notificationService = inject(NotificationService);

  readonly mode = signal<DocumentDraftMode>('resume');
  readonly selectedGuideAction = signal<DocumentGuideAction | null>(null);

  private readonly drafts = signal<DraftState>({
    resume: null,
    coverLetter: null,
  });

  readonly guideActions = signal<DocumentGuideAction[]>([
    {
      id: 'results',
      labelKey: 'workstation.assets.guide.results.label',
      descriptionKey: 'workstation.assets.guide.results.body',
      mode: 'resume',
      action: 'select',
    },
    {
      id: 'tighten',
      labelKey: 'workstation.assets.guide.tighten.label',
      descriptionKey: 'workstation.assets.guide.tighten.body',
      mode: 'both',
      action: 'select',
    },
    {
      id: 'align',
      labelKey: 'workstation.assets.guide.align.label',
      descriptionKey: 'workstation.assets.guide.align.body',
      mode: 'resume',
      action: 'regenerate',
    },
    {
      id: 'coverTone',
      labelKey: 'workstation.assets.guide.coverTone.label',
      descriptionKey: 'workstation.assets.guide.coverTone.body',
      mode: 'coverLetter',
      action: 'select',
    },
  ]);

  readonly activeGuideActions = computed(() =>
    this.guideActions().filter((action) => action.mode === 'both' || action.mode === this.mode()),
  );

  readonly currentDraft = computed<DocumentDraft | null>(() => {
    const app = this.store.selectedApplication();
    if (!app) return null;

    const mode = this.mode();
    const existing = this.drafts()[mode];
    if (existing?.applicationId === app.id) {
      return existing;
    }

    const sourceContent = this.resolveSourceContent(mode);
    return {
      applicationId: app.id,
      mode,
      content: sourceContent,
      sourceContent,
      isDirty: false,
      generatedAt: sourceContent ? new Date().toISOString() : undefined,
    };
  });

  readonly wordCount = computed(() => this.countWords(this.currentDraft()?.content ?? ''));

  readonly hasCurrentDraftContent = computed(() => !!this.currentDraft()?.content.trim());

  readonly isCurrentDraftDirty = computed(() => !!this.currentDraft()?.isDirty);

  readonly readinessItems = computed(() => {
    const app = this.store.selectedApplication();
    const hasJobDescription = !!app?.description?.trim();
    const hasMasterResume = !!this.documentStore.masterResume();
    const hasSkills = this.profileStore.userSkills().length > 0;
    const skillsLoading = this.profileStore.isLoading();

    return [
      {
        id: 'master',
        ready: hasMasterResume,
        labelKey: 'workstation.assets.readiness.master.label',
        bodyKey: hasMasterResume
          ? 'workstation.assets.readiness.master.ready'
          : 'workstation.assets.readiness.master.missing',
      },
      {
        id: 'job',
        ready: hasJobDescription,
        labelKey: 'workstation.assets.readiness.job.label',
        bodyKey: hasJobDescription
          ? 'workstation.assets.readiness.job.ready'
          : 'workstation.assets.readiness.job.missing',
      },
      {
        id: 'skills',
        ready: hasSkills,
        labelKey: 'workstation.assets.readiness.skills.label',
        bodyKey: skillsLoading
          ? 'workstation.assets.readiness.skills.loading'
          : hasSkills
            ? 'workstation.assets.readiness.skills.ready'
            : 'workstation.assets.readiness.skills.missing',
      },
    ];
  });

  readonly readyInputCount = computed(
    () => this.readinessItems().filter((item) => item.ready).length,
  );

  readonly canGenerateDocuments = computed(() => this.readinessItems().every((item) => item.ready));

  readonly activeModeLabelKey = computed(() =>
    this.mode() === 'resume' ? 'workstation.assets.resumeDraft' : 'workstation.assets.coverLetter',
  );

  readonly activeModeDescriptionKey = computed(() =>
    this.mode() === 'resume'
      ? 'workstation.assets.resumeDraftBody'
      : 'workstation.assets.coverLetterBody',
  );

  ngOnInit(): void {
    if (this.documentStore.documents().length === 0) {
      this.documentStore.loadAll();
    }

    if (!this.profileStore.profile() && this.profileStore.userSkills().length === 0) {
      this.profileStore.loadProfile();
    }
  }

  setMode(mode: DocumentDraftMode): void {
    this.mode.set(mode);
  }

  onDraftInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.updateDraft(target.value);
  }

  regenerateCurrentDraft(): void {
    if (!this.canGenerateDocuments()) {
      this.notificationService.info(
        'Add a master resume, job description, and profile skills before generating a draft.',
        'Document context',
      );
      return;
    }

    if (this.mode() === 'resume') {
      this.generateResumeDraft();
    } else {
      this.generateCoverLetterDraft();
    }
  }

  generateResumeDraft(): void {
    const app = this.store.selectedApplication();
    if (!app) return;

    this.mode.set('resume');
    this.store.generateResumeDraft(app.id).subscribe((content) => {
      if (content.trim()) {
        this.writeGeneratedDraft('resume', content);
      }
    });
  }

  generateCoverLetterDraft(): void {
    const app = this.store.selectedApplication();
    if (!app) return;

    this.mode.set('coverLetter');
    this.store.generateCoverLetterDraft(app.id).subscribe((content) => {
      if (content.trim()) {
        this.writeGeneratedDraft('coverLetter', content);
      }
    });
  }

  resetDraft(): void {
    const current = this.currentDraft();
    if (!current) return;

    this.drafts.update((drafts) => ({
      ...drafts,
      [current.mode]: {
        ...current,
        content: current.sourceContent,
        isDirty: false,
      },
    }));
  }

  copyDraft(): void {
    this.copyContent(this.currentDraft()?.content);
  }

  exportDraft(): void {
    const mode = this.mode();
    const filename = mode === 'resume' ? 'resume_draft' : 'cover_letter_draft';
    this.downloadPlainText(this.currentDraft()?.content, filename);
  }

  selectGuideAction(action: DocumentGuideAction): void {
    if (action.action === 'regenerate') {
      this.regenerateCurrentDraft();
      return;
    }

    this.selectedGuideAction.set(action);
  }

  private updateDraft(content: string): void {
    const app = this.store.selectedApplication();
    if (!app) return;

    const mode = this.mode();
    const current = this.currentDraft();
    const sourceContent = current?.sourceContent ?? this.resolveSourceContent(mode);

    this.drafts.update((drafts) => ({
      ...drafts,
      [mode]: {
        applicationId: app.id,
        mode,
        content,
        sourceContent,
        isDirty: content !== sourceContent,
        generatedAt: current?.generatedAt,
      },
    }));
  }

  private writeGeneratedDraft(mode: DocumentDraftMode, content: string): void {
    const app = this.store.selectedApplication();
    if (!app) return;

    this.drafts.update((drafts) => ({
      ...drafts,
      [mode]: {
        applicationId: app.id,
        mode,
        content,
        sourceContent: content,
        isDirty: false,
        generatedAt: new Date().toISOString(),
      },
    }));
  }

  private resolveSourceContent(mode: DocumentDraftMode): string {
    const app = this.store.selectedApplication();
    if (!app) return '';

    if (mode === 'resume') {
      return this.store.tailoredResume() ?? app.tailoredResume ?? '';
    }

    return app.generatedCoverLetter ?? '';
  }

  private copyContent(text: string | null | undefined): void {
    if (!text?.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success('Draft copied to clipboard.', 'Document Studio');
    });
  }

  private downloadPlainText(text: string | null | undefined, filename: string): void {
    if (!text?.trim()) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.txt`;
    anchor.click();
    globalThis.URL.revokeObjectURL(url);

    this.notificationService.info('Exported as a plaintext draft.', 'Document Studio');
  }

  private countWords(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }
}
