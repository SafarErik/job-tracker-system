import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideBriefcaseBusiness,
  lucideCheck,
  lucideCopy,
  lucideDownload,
  lucideFileText,
  lucideGraduationCap,
  lucideLightbulb,
  lucideListChecks,
  lucideLoader2,
  lucideMail,
  lucideMessageSquareText,
  lucideRotateCcw,
  lucideSend,
  lucideTarget,
  lucideUserRound,
} from '@ng-icons/lucide';
import { AptelionEmptyStateComponent } from '../../../../../shared/components/aptelion-empty-state/aptelion-empty-state.component';
import { AptelionSectionHeaderComponent } from '../../../../../shared/components/aptelion-section-header/aptelion-section-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { JobApplication } from '../../../models/job-application.model';
import { JobApplicationStore } from '../../../services/job-application.store';
import { DocumentStore } from '../../../../documents/services/document.store';
import { ProfileStore } from '../../../../profile/services/profile.store';
import { NotificationService } from '../../../../../core/services/notification.service';

export type DocumentDraftMode = 'resume' | 'coverLetter';

export type CvBlockType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education'
  | 'coverLetter';

export interface CvBasics {
  name: string;
  title: string;
  subtitle: string;
  email?: string | null;
  location?: string | null;
  photoUrl?: string | null;
}

export interface CvBlock {
  id: string;
  type: CvBlockType;
  title: string;
  content?: string;
  items?: string[];
  meta?: Record<string, string>;
}

export interface CvDocumentDraft {
  applicationId: string;
  mode: DocumentDraftMode;
  basics: CvBasics;
  blocks: CvBlock[];
  selectedBlockId: string | null;
  sourceText: string;
  updatedAt: string;
  isDirty: boolean;
}

export interface DocumentAgentMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  blockId?: string | null;
  status: 'sent' | 'thinking';
  createdAt: string;
}

export interface DocumentAgentQuickPrompt {
  id: string;
  labelKey: string;
  instructionKey: string;
  mode: DocumentDraftMode | 'both';
}

export interface CvBlockEditResponse {
  chat: string;
  updated_json: CvBlock;
}

type DraftState = Record<DocumentDraftMode, CvDocumentDraft | null>;

@Component({
  selector: 'app-assets-view',
  imports: [
    CommonModule,
    FormsModule,
    TranslocoPipe,
    NgIcon,
    AptelionEmptyStateComponent,
    AptelionSectionHeaderComponent,
    StatusBadgeComponent,
  ],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideBriefcaseBusiness,
      lucideCheck,
      lucideCopy,
      lucideDownload,
      lucideFileText,
      lucideGraduationCap,
      lucideLightbulb,
      lucideListChecks,
      lucideLoader2,
      lucideMail,
      lucideMessageSquareText,
      lucideRotateCcw,
      lucideSend,
      lucideTarget,
      lucideUserRound,
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
  private readonly transloco = inject(TranslocoService);

  readonly mode = signal<DocumentDraftMode>('resume');
  readonly agentInput = signal('');
  readonly isAgentThinking = signal(false);
  readonly agentMessages = signal<DocumentAgentMessage[]>([]);

  private readonly documentDrafts = signal<DraftState>({
    resume: null,
    coverLetter: null,
  });

  readonly quickPrompts = signal<DocumentAgentQuickPrompt[]>([
    {
      id: 'results',
      labelKey: 'workstation.assets.visual.quick.results',
      instructionKey: 'workstation.assets.visual.instructions.results',
      mode: 'resume',
    },
    {
      id: 'tighten',
      labelKey: 'workstation.assets.visual.quick.tighten',
      instructionKey: 'workstation.assets.visual.instructions.tighten',
      mode: 'both',
    },
    {
      id: 'align',
      labelKey: 'workstation.assets.visual.quick.align',
      instructionKey: 'workstation.assets.visual.instructions.align',
      mode: 'resume',
    },
    {
      id: 'cover',
      labelKey: 'workstation.assets.visual.quick.cover',
      instructionKey: 'workstation.assets.visual.instructions.cover',
      mode: 'coverLetter',
    },
  ]);

  readonly activeQuickPrompts = computed(() =>
    this.quickPrompts().filter((prompt) => prompt.mode === 'both' || prompt.mode === this.mode()),
  );

  readonly currentDocument = computed<CvDocumentDraft | null>(() => {
    const app = this.store.selectedApplication();
    if (!app) return null;

    const mode = this.mode();
    const existing = this.documentDrafts()[mode];
    if (existing?.applicationId === app.id) {
      return existing;
    }

    return this.createDocumentDraft(app, mode, this.resolveSourceContent(mode));
  });

  readonly selectedBlock = computed<CvBlock | null>(() => {
    const document = this.currentDocument();
    if (!document?.selectedBlockId) return null;

    return document.blocks.find((block) => block.id === document.selectedBlockId) ?? null;
  });

  readonly hasDocumentContent = computed(() => {
    const document = this.currentDocument();
    if (!document) return false;

    return (
      !!document.sourceText.trim() ||
      document.blocks.some((block) => !!block.content?.trim() || (block.items?.length ?? 0) > 0)
    );
  });

  readonly wordCount = computed(() => this.countWords(this.serializeDocument(this.currentDocument())));

  readonly isCurrentDraftDirty = computed(() => !!this.currentDocument()?.isDirty);

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

  selectBlock(blockId: string): void {
    this.updateCurrentDocument((document) => ({
      ...document,
      selectedBlockId: blockId,
    }));
  }

  isBlockSelected(blockId: string): boolean {
    return this.currentDocument()?.selectedBlockId === blockId;
  }

  regenerateCurrentDraft(): void {
    if (!this.canGenerateDocuments()) {
      this.notificationService.info(
        this.transloco.translate('workstation.assets.visual.notifications.missingInputs'),
        this.transloco.translate('workstation.assets.visual.notifications.contextTitle'),
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
    const app = this.store.selectedApplication();
    const document = this.currentDocument();
    if (!app || !document) return;

    this.documentDrafts.update((drafts) => ({
      ...drafts,
      [document.mode]: this.createDocumentDraft(app, document.mode, document.sourceText),
    }));
  }

  copyDraft(): void {
    const text = this.serializeDocument(this.currentDocument());
    if (!text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success(
        this.transloco.translate('workstation.assets.visual.notifications.copied'),
        this.transloco.translate('workstation.assets.visual.notifications.studioTitle'),
      );
    });
  }

  exportDraft(): void {
    const text = this.serializeDocument(this.currentDocument());
    if (!text.trim()) return;

    const filename = this.mode() === 'resume' ? 'resume_draft' : 'cover_letter_draft';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.txt`;
    anchor.click();
    globalThis.URL.revokeObjectURL(url);

    this.notificationService.info(
      this.transloco.translate('workstation.assets.visual.notifications.exported'),
      this.transloco.translate('workstation.assets.visual.notifications.studioTitle'),
    );
  }

  applyQuickPrompt(prompt: DocumentAgentQuickPrompt): void {
    this.submitAgentInstruction(this.transloco.translate(prompt.instructionKey));
  }

  submitAgentInstruction(instruction = this.agentInput().trim()): void {
    const document = this.currentDocument();
    if (!document || !this.hasDocumentContent()) return;

    const targetBlock = this.selectedBlock() ?? document.blocks.find((block) => block.id !== 'header');
    if (!targetBlock) return;

    const cleanInstruction = instruction.trim();
    if (!cleanInstruction) return;

    this.agentInput.set('');
    this.selectBlock(targetBlock.id);
    this.agentMessages.update((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: cleanInstruction,
        blockId: targetBlock.id,
        status: 'sent',
        createdAt: new Date().toISOString(),
      },
    ]);
    this.isAgentThinking.set(true);

    const mode = document.mode;
    const blockId = targetBlock.id;

    setTimeout(() => {
      const activeDocument = this.documentDrafts()[mode] ?? this.currentDocument();
      const activeBlock = activeDocument?.blocks.find((block) => block.id === blockId);
      if (!activeDocument || !activeBlock) {
        this.isAgentThinking.set(false);
        return;
      }

      const updatedBlock = this.mockRewriteBlock(activeBlock, cleanInstruction);
      this.updateDocument(mode, (draft) => ({
        ...draft,
        blocks: draft.blocks.map((block) => (block.id === blockId ? updatedBlock : block)),
        selectedBlockId: blockId,
        updatedAt: new Date().toISOString(),
        isDirty: true,
      }));

      this.agentMessages.update((messages) => [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: 'agent',
          content: this.transloco.translate('workstation.assets.visual.agent.updatedResponse'),
          blockId,
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      ]);
      this.isAgentThinking.set(false);
    }, 1500);
  }

  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    return initials || 'H';
  }

  getBlockIcon(block: CvBlock): string {
    switch (block.type) {
      case 'experience':
        return 'lucideBriefcaseBusiness';
      case 'skills':
        return 'lucideListChecks';
      case 'education':
        return 'lucideGraduationCap';
      case 'coverLetter':
        return 'lucideMail';
      case 'header':
        return 'lucideUserRound';
      default:
        return 'lucideTarget';
    }
  }

  contentParagraphs(content: string | undefined): string[] {
    return (content ?? '')
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  blockPreview(block: CvBlock): string {
    if (block.content?.trim()) {
      return block.content;
    }

    return (block.items ?? []).slice(0, 3).join(' / ');
  }

  private updateCurrentDocument(updater: (document: CvDocumentDraft) => CvDocumentDraft): void {
    const document = this.currentDocument();
    if (!document) return;

    this.documentDrafts.update((drafts) => ({
      ...drafts,
      [document.mode]: updater(document),
    }));
  }

  private updateDocument(
    mode: DocumentDraftMode,
    updater: (document: CvDocumentDraft) => CvDocumentDraft,
  ): void {
    const existing = this.documentDrafts()[mode];
    const current = this.currentDocument();
    const document = existing ?? (current?.mode === mode ? current : null);
    if (!document) return;

    this.documentDrafts.update((drafts) => ({
      ...drafts,
      [mode]: updater(document),
    }));
  }

  private writeGeneratedDraft(mode: DocumentDraftMode, content: string): void {
    const app = this.store.selectedApplication();
    if (!app) return;

    this.documentDrafts.update((drafts) => ({
      ...drafts,
      [mode]: this.createDocumentDraft(app, mode, content),
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

  private createDocumentDraft(
    app: JobApplication,
    mode: DocumentDraftMode,
    sourceText: string,
  ): CvDocumentDraft {
    const basics = this.createBasics(app);
    const blocks =
      mode === 'resume'
        ? this.createResumeBlocks(app, sourceText, basics)
        : this.createCoverLetterBlocks(sourceText);

    return {
      applicationId: app.id,
      mode,
      basics,
      blocks,
      selectedBlockId: blocks.find((block) => block.type !== 'header')?.id ?? blocks[0]?.id ?? null,
      sourceText,
      updatedAt: new Date().toISOString(),
      isDirty: false,
    };
  }

  private createBasics(app: JobApplication): CvBasics {
    const profile = this.profileStore.profile();
    const fullName = profile?.fullName?.trim() || 'Aptelion Candidate';
    const title = profile?.currentJobTitle?.trim() || app.position;

    return {
      name: fullName,
      title,
      subtitle: this.transloco.translate('workstation.assets.visual.basics.subtitle', {
        role: app.position,
        company: app.companyName ?? this.transloco.translate('common.states.unknown'),
      }),
      email: profile?.email ?? null,
      photoUrl: profile?.profilePictureUrl ?? null,
    };
  }

  private createResumeBlocks(
    app: JobApplication,
    sourceText: string,
    basics: CvBasics,
  ): CvBlock[] {
    if (!sourceText.trim()) return [];

    const paragraphs = this.splitParagraphs(sourceText);
    const lines = this.normalizeLines(sourceText);
    const skills = this.unique([
      ...app.skills,
      ...this.profileStore.userSkills().map((skill) => skill.name),
    ]).slice(0, 14);
    const bulletItems = lines
      .filter((line) => /^[-*\u2022]/.test(line))
      .map((line) => line.replace(/^[-*\u2022]\s*/, '').trim())
      .filter(Boolean);
    const fallbackExperience = this.sentences(paragraphs.slice(1).join(' ')).slice(0, 4);

    return [
      {
        id: 'header',
        type: 'header',
        title: this.transloco.translate('workstation.assets.visual.sections.header'),
        content: `${basics.name}\n${basics.title}`,
      },
      {
        id: 'summary',
        type: 'summary',
        title: this.transloco.translate('workstation.assets.visual.sections.summary'),
        content:
          paragraphs[0] ??
          this.transloco.translate('workstation.assets.visual.fallback.summary', {
            role: app.position,
          }),
      },
      {
        id: 'experience',
        type: 'experience',
        title: this.transloco.translate('workstation.assets.visual.sections.experience'),
        items:
          bulletItems.length > 0
            ? bulletItems.slice(0, 6)
            : fallbackExperience.length > 0
              ? fallbackExperience
              : [
                  this.transloco.translate('workstation.assets.visual.fallback.experience', {
                    role: app.position,
                  }),
                ],
        meta: {
          company: app.companyName ?? '',
          role: app.position,
        },
      },
      {
        id: 'skills',
        type: 'skills',
        title: this.transloco.translate('workstation.assets.visual.sections.skills'),
        items:
          skills.length > 0
            ? skills
            : [this.transloco.translate('workstation.assets.visual.fallback.skills')],
      },
      {
        id: 'education',
        type: 'education',
        title: this.transloco.translate('workstation.assets.visual.sections.education'),
        content: this.extractEducationText(sourceText),
      },
    ];
  }

  private createCoverLetterBlocks(sourceText: string): CvBlock[] {
    if (!sourceText.trim()) return [];

    return [
      {
        id: 'cover-letter',
        type: 'coverLetter',
        title: this.transloco.translate('workstation.assets.visual.sections.coverLetter'),
        content: sourceText.trim(),
      },
    ];
  }

  private mockRewriteBlock(block: CvBlock, instruction: string): CvBlock {
    const lowerInstruction = instruction.toLowerCase();
    const meta = {
      ...(block.meta ?? {}),
      updated: this.transloco.translate('workstation.assets.visual.agent.editedBadge'),
    };

    if (block.type === 'skills') {
      return {
        ...block,
        meta,
        items: this.unique([
          ...(block.items ?? []),
          ...(this.store.selectedApplication()?.skills ?? []),
        ]).slice(0, 16),
      };
    }

    if (block.items?.length) {
      const [first, ...rest] = block.items;
      return {
        ...block,
        meta,
        items: [this.polishLine(first, lowerInstruction), ...rest],
      };
    }

    return {
      ...block,
      meta,
      content: this.polishContent(block.content ?? '', lowerInstruction, block.type),
    };
  }

  private polishLine(line: string, instruction: string): string {
    if (instruction.includes('tight')) {
      return line.replace(/\s+/g, ' ').trim();
    }

    if (instruction.includes('result') || instruction.includes('eredm')) {
      return `${line.replace(/\.$/, '')}, ${this.transloco.translate('workstation.assets.visual.mock.resultLine')}`;
    }

    if (instruction.includes('align') || instruction.includes('role')) {
      return `${line.replace(/\.$/, '')}, ${this.transloco.translate('workstation.assets.visual.mock.alignLine')}`;
    }

    return `${line.replace(/\.$/, '')}, ${this.transloco.translate('workstation.assets.visual.mock.fitLine')}`;
  }

  private polishContent(content: string, instruction: string, blockType: CvBlockType): string {
    const normalized = content.trim();
    if (!normalized) {
      return this.transloco.translate('workstation.assets.visual.fallback.blockContent');
    }

    if (instruction.includes('tight')) {
      return this.sentences(normalized).slice(0, 2).join(' ');
    }

    if (blockType === 'coverLetter') {
      return `${normalized}\n\n${this.transloco.translate('workstation.assets.visual.fallback.coverClosing')}`;
    }

    if (instruction.includes('result') || instruction.includes('eredm')) {
      return `${normalized} ${this.transloco.translate('workstation.assets.visual.fallback.resultSentence')}`;
    }

    return `${normalized} ${this.transloco.translate('workstation.assets.visual.fallback.alignmentSentence')}`;
  }

  private serializeDocument(document: CvDocumentDraft | null): string {
    if (!document) return '';

    if (document.mode === 'coverLetter') {
      return document.blocks.map((block) => block.content ?? '').join('\n\n').trim();
    }

    return [
      document.basics.name,
      document.basics.title,
      document.basics.subtitle,
      '',
      ...document.blocks
        .filter((block) => block.type !== 'header')
        .flatMap((block) => [
          block.title,
          block.content ?? '',
          ...(block.items ?? []).map((item) => `- ${item}`),
          '',
        ]),
    ]
      .join('\n')
      .trim();
  }

  private splitParagraphs(text: string): string[] {
    return text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  private normalizeLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private sentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  private extractEducationText(text: string): string {
    const lines = this.normalizeLines(text);
    const educationIndex = lines.findIndex((line) => /education|certification|degree/i.test(line));
    if (educationIndex === -1) {
      return this.transloco.translate('workstation.assets.visual.fallback.education');
    }

    return lines.slice(educationIndex, educationIndex + 3).join('\n');
  }

  private unique(items: string[]): string[] {
    return Array.from(
      new Set(items.map((item) => item.trim()).filter((item) => item.length > 0)),
    );
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
}
