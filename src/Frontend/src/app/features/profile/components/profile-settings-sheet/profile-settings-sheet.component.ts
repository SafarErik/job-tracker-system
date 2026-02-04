import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideMail, lucideLock, lucideKey, lucideX, lucideCheck, lucideLoader2, lucideSave, lucideBrain, lucideLink, lucideShield, lucideGlobe, lucideCoins, lucideClock, lucideTrash2, lucideChevronRight, lucideExternalLink, lucideDownload, lucideSparkles } from '@ng-icons/lucide';
import { toast } from 'ngx-sonner';
import { UserProfile } from '../../models/profile.model';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { ProfileStore } from '../../services/profile.store';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { BrnSwitchImports } from '@spartan-ng/brain/switch';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
    selector: 'app-profile-settings-sheet',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ...HlmSheetImports,
        ...BrnSheetImports,
        ...HlmButtonImports,
        ...HlmInputImports,
        ...HlmLabelImports,
        ...HlmSwitchImports,
        ...BrnSwitchImports,
        ...BrnSelectImports,
        ...HlmSelectImports,
        NgIcon,
    ],
    providers: [
        provideIcons({
            lucideSettings, lucideMail, lucideLock, lucideKey,
            lucideX, lucideCheck, lucideLoader2, lucideSave,
            lucideBrain, lucideLink, lucideShield, lucideGlobe,
            lucideCoins, lucideClock, lucideTrash2, lucideChevronRight,
            lucideExternalLink, lucideDownload, lucideSparkles
        })
    ],
    template: `
<hlm-sheet side="right" class="border-l border-border" [state]="uiService.isProfileSettingsOpen() ? 'open' : 'closed'" (closed)="uiService.closeProfileSettings()">
    <hlm-sheet-content *brnSheetContent="let ctx"
        class="w-full sm:max-w-3xl bg-background border-l border-border p-0 shadow-2xl flex flex-col h-full overflow-hidden">

        <!-- Header -->
        <div class="px-8 py-6 space-y-1 border-b border-border/50 bg-muted/20 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-foreground shadow-sm">
                        <ng-icon name="lucideSettings" class="h-5 w-5"></ng-icon>
                    </div>
                    <div>
                        <h3 class="text-xl font-serif text-foreground tracking-tight">Command Center</h3>
                        <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">System Overrides & Parameters</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- Main Body: Two Columns -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Sidebar Navigation -->
            <aside class="w-64 border-r border-border/50 bg-muted/5 p-4 flex flex-col gap-2">
                @for (item of navItems; track item.id) {
                    <button (click)="activeSection.set(item.id)"
                        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
                        [class.bg-foreground]="activeSection() === item.id"
                        [class.text-background]="activeSection() === item.id"
                        [class.text-muted-foreground]="activeSection() !== item.id"
                        [class.hover:bg-muted]="activeSection() !== item.id">
                        
                        <ng-icon [name]="item.icon" class="h-5 w-5"></ng-icon>
                        <div class="flex flex-col items-start">
                            <span class="text-xs font-bold uppercase tracking-widest">{{ item.label }}</span>
                            <span class="text-[9px] opacity-70 leading-none" [class.text-background/80]="activeSection() === item.id">{{ item.sub }}</span>
                        </div>

                        @if (activeSection() === item.id) {
                            <ng-icon name="lucideChevronRight" class="absolute right-3 h-3 w-3"></ng-icon>
                        }
                    </button>
                }

                <div class="mt-auto p-4 rounded-2xl bg-muted/20 border border-border/50">
                    <div class="flex items-center gap-2 mb-2 text-primary">
                        <ng-icon name="lucideShield" class="h-3 w-3"></ng-icon>
                        <span class="text-[9px] font-black uppercase tracking-widest">Trust Store</span>
                    </div>
                    <p class="text-[9px] text-muted-foreground leading-tight">All transmissions are encrypted via zero-knowledge protocols.</p>
                </div>
            </aside>

            <!-- Content Pane -->
            <main class="flex-1 overflow-y-auto custom-scrollbar bg-background">
                <form [formGroup]="form" class="p-8 space-y-10">
                    
                    <!-- 1. INTELLIGENCE -->
                    @if (activeSection() === 'intelligence') {
                        <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <header class="space-y-1">
                                <h4 class="text-xl font-serif font-bold">Neural Core</h4>
                                <p class="text-xs text-muted-foreground">Calibrate the intelligence engine and AI personality types.</p>
                            </header>

                            <!-- AI Tone Pills -->
                            <div class="space-y-4">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Persona Alignment</label>
                                <div class="flex flex-wrap gap-2">
                                    @for (tone of aiTones; track tone) {
                                        <button (click)="form.patchValue({aiTone: tone})"
                                            class="px-4 py-2 rounded-full text-xs font-bold transition-all border"
                                            [class.bg-primary]="form.get('aiTone')?.value === tone"
                                            [class.text-primary-foreground]="form.get('aiTone')?.value === tone"
                                            [class.border-primary]="form.get('aiTone')?.value === tone"
                                            [class.bg-muted]="form.get('aiTone')?.value !== tone"
                                            [class.text-muted-foreground]="form.get('aiTone')?.value !== tone"
                                            [class.border-border]="form.get('aiTone')?.value !== tone">
                                            {{ tone }}
                                        </button>
                                    }
                                </div>
                            </div>

                            <!-- API Keys -->
                            <div class="space-y-6">
                                <div class="space-y-2">
                                    <label hlmLabel class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gemini API Matrix</label>
                                    <div class="relative">
                                        <ng-icon name="lucideKey" class="absolute left-3 top-3.5 text-muted-foreground h-4 w-4"></ng-icon>
                                        <input hlmInput type="password" formControlName="geminiKey"
                                            class="pl-10 bg-muted/30 border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                            placeholder="AIZA..." />
                                    </div>
                                </div>

                                <div class="space-y-2">
                                    <label hlmLabel class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OpenAI Key (Personal)</label>
                                    <div class="relative">
                                        <ng-icon name="lucideKey" class="absolute left-3 top-3.5 text-muted-foreground h-4 w-4"></ng-icon>
                                        <input hlmInput type="password" formControlName="openAiKey"
                                            class="pl-10 bg-muted/30 border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                            placeholder="sk-..." />
                                    </div>
                                </div>
                            </div>

                            <!-- Deep Search Toggle -->
                            <div class="p-6 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between gap-6">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <ng-icon name="lucideSparkles" class="h-4 w-4 text-primary"></ng-icon>
                                        <h5 class="text-sm font-bold">Deep Search Protocol</h5>
                                    </div>
                                    <p class="text-xs text-muted-foreground leading-relaxed">Enable multithreaded web crawling via Firecrawl for deeper company intelligence. High latency, high accuracy.</p>
                                </div>
                                <hlm-switch formControlName="deepSearch"></hlm-switch>
                            </div>
                        </div>
                    }

                    <!-- 2. CONNECTIVITY -->
                    @if (activeSection() === 'connectivity') {
                        <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <header class="space-y-1">
                                <h4 class="text-xl font-serif font-bold">Signal Bridges</h4>
                                <p class="text-xs text-muted-foreground">Manage external connections and data ingestion pipelines.</p>
                            </header>

                            <!-- Google Calendar -->
                            <div class="p-6 rounded-2xl border border-border flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="h-10 w-10 flex items-center justify-center bg-blue-500/10 rounded-xl text-blue-500">
                                        <ng-icon name="lucideLink" class="h-5 w-5"></ng-icon>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h5 class="text-sm font-bold">Google Calendar</h5>
                                            <span class="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter"
                                                [class.bg-emerald-500/20]="form.get('googleCalendarConnected')?.value"
                                                [class.text-emerald-500]="form.get('googleCalendarConnected')?.value"
                                                [class.bg-muted]="!form.get('googleCalendarConnected')?.value"
                                                [class.text-muted-foreground]="!form.get('googleCalendarConnected')?.value">
                                                {{ form.get('googleCalendarConnected')?.value ? 'Active Sync' : 'Offline' }}
                                            </span>
                                        </div>
                                        <p class="text-xs text-muted-foreground mt-0.5">Automated interview scheduling and time tracking.</p>
                                    </div>
                                </div>
                                <button hlmBtn variant="outline" size="sm" class="rounded-lg h-9" 
                                    (click)="toggleConnection('googleCalendarConnected')">
                                    {{ form.get('googleCalendarConnected')?.value ? 'Disconnect' : 'Connect' }}
                                </button>
                            </div>

                            <!-- Job Boards -->
                            <div class="space-y-4">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Intelligence Feed</label>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    @for (board of ['LinkedIn', 'Indeed', 'Glassdoor']; track board) {
                                        <div class="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
                                            <label [for]="board" class="text-xs font-bold">{{ board }}</label>
                                            <hlm-switch [id]="board" [checked]="isJobBoardChecked(board)" (changed)="toggleJobBoard(board)"></hlm-switch>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }

                    <!-- 3. PREFERENCES -->
                    @if (activeSection() === 'preferences') {
                        <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <header class="space-y-1">
                                <h4 class="text-xl font-serif font-bold">Environment</h4>
                                <p class="text-xs text-muted-foreground">Tailor the visual interface and local parameters.</p>
                            </header>

                            <!-- Theme Selector -->
                            <div class="space-y-4">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skin Preference</label>
                                <div class="grid grid-cols-3 gap-3">
                                    @for (t of themeOptions; track t.id) {
                                        <button (click)="setTheme(t.id)"
                                            class="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all"
                                            [class.border-primary]="themeService.themeSetting() === t.id"
                                            [class.bg-primary/5]="themeService.themeSetting() === t.id"
                                            [class.border-border]="themeService.themeSetting() !== t.id"
                                            [class.bg-muted/10]="themeService.themeSetting() !== t.id">
                                            <div class="h-10 w-10 rounded-full flex items-center justify-center" [class]="t.previewClass">
                                                <ng-icon [name]="t.icon" class="h-5 w-5"></ng-icon>
                                            </div>
                                            <span class="text-[10px] font-bold uppercase tracking-widest">{{ t.label }}</span>
                                        </button>
                                    }
                                </div>
                            </div>

                            <!-- Currency & Period -->
                            <div class="grid grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label hlmLabel class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Baseline Currency</label>
                                    <brn-select formControlName="currency" placeholder="Select Currency">
                                        <hlm-select-trigger class="w-full rounded-xl h-11 border-border bg-muted/30">
                                            <hlm-select-value></hlm-select-value>
                                        </hlm-select-trigger>
                                        <hlm-select-content class="rounded-xl border-border">
                                            <hlm-option value="USD">USD ($)</hlm-option>
                                            <hlm-option value="EUR">EUR (€)</hlm-option>
                                            <hlm-option value="GBP">GBP (£)</hlm-option>
                                            <hlm-option value="HUF">HUF (Ft)</hlm-option>
                                        </hlm-select-content>
                                    </brn-select>
                                </div>
                                <div class="space-y-2">
                                    <label hlmLabel class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salary Epoch</label>
                                    <brn-select formControlName="salaryPeriod" placeholder="Select Period">
                                        <hlm-select-trigger class="w-full rounded-xl h-11 border-border bg-muted/30">
                                            <hlm-select-value></hlm-select-value>
                                        </hlm-select-trigger>
                                        <hlm-select-content class="rounded-xl border-border">
                                            <hlm-option value="Yearly">Yearly</hlm-option>
                                            <hlm-option value="Monthly">Monthly</hlm-option>
                                            <hlm-option value="Hourly">Hourly</hlm-option>
                                        </hlm-select-content>
                                    </brn-select>
                                </div>
                            </div>

                            <!-- Language -->
                            <div class="space-y-2">
                                <label hlmLabel class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Language</label>
                                <div class="flex gap-2">
                                    <button hlmBtn variant="outline" class="flex-1 rounded-xl h-11 gap-2"
                                        [class.bg-primary]="form.get('language')?.value === 'English'"
                                        [class.text-background]="form.get('language')?.value === 'English'"
                                        (click)="form.patchValue({language: 'English'})">
                                        <ng-icon name="lucideGlobe" class="h-4 w-4"></ng-icon>
                                        English
                                    </button>
                                    <button hlmBtn variant="outline" class="flex-1 rounded-xl h-11 gap-2"
                                        [class.bg-primary]="form.get('language')?.value === 'Hungarian'"
                                        [class.text-background]="form.get('language')?.value === 'Hungarian'"
                                        (click)="form.patchValue({language: 'Hungarian'})">
                                        <ng-icon name="lucideGlobe" class="h-4 w-4"></ng-icon>
                                        Hungarian
                                    </button>
                                </div>
                            </div>
                        </div>
                    }

                    <!-- 4. SECURITY & DATA -->
                    @if (activeSection() === 'security') {
                        <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <header class="space-y-1">
                                <h4 class="text-xl font-serif font-bold">Data & Sovereignty</h4>
                                <p class="text-xs text-muted-foreground">Export your datasets or wipe all traces from the core.</p>
                            </header>

                            <!-- Credentials Section -->
                            <div class="space-y-4">
                                <label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Tokens</label>
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label hlmLabel class="text-xs font-bold text-muted-foreground">Identity Email (Immutable)</label>
                                        <div class="relative">
                                            <ng-icon name="lucideMail" class="absolute left-3 top-3.5 text-muted-foreground h-4 w-4"></ng-icon>
                                            <input hlmInput formControlName="email" readonly
                                                class="pl-10 bg-muted/40 border-dashed border-border text-muted-foreground cursor-not-allowed rounded-xl h-11 w-full" />
                                        </div>
                                    </div>

                                    <div class="space-y-2">
                                        <label hlmLabel class="text-xs font-bold text-muted-foreground">Override Password</label>
                                        <div class="relative">
                                            <ng-icon name="lucideLock" class="absolute left-3 top-3.5 text-muted-foreground h-4 w-4"></ng-icon>
                                            <input hlmInput type="password" formControlName="password"
                                                class="pl-10 bg-muted/30 border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="h-px bg-border/50"></div>

                            <!-- Action Buttons -->
                            <div class="space-y-4">
                                <button hlmBtn variant="outline" class="w-full h-14 rounded-2xl justify-between px-6 border-border hover:bg-muted group" (click)="exportDossier()">
                                    <div class="flex items-center gap-4">
                                        <div class="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <ng-icon name="lucideDownload" class="h-4 w-4"></ng-icon>
                                        </div>
                                        <div class="text-left">
                                            <div class="text-sm font-bold">Export Global Dossier</div>
                                            <div class="text-[10px] text-muted-foreground">Encrypted JSON Package</div>
                                        </div>
                                    </div>
                                    <ng-icon name="lucideExternalLink" class="h-4 w-4 text-muted-foreground opacity-50"></ng-icon>
                                </button>

                                <div class="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
                                    <div class="flex items-start gap-4">
                                        <div class="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                            <ng-icon name="lucideTrash2" class="h-4 w-4"></ng-icon>
                                        </div>
                                        <div class="space-y-1">
                                            <h5 class="text-sm font-bold text-destructive">Danger Zone: Termination</h5>
                                            <p class="text-xs text-muted-foreground">This will permanently purge your operative profile and all associated job tracking telemetry from the system.</p>
                                        </div>
                                    </div>
                                    <button hlmBtn variant="outline" class="w-full h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all uppercase tracking-widest text-[10px] font-black" 
                                        (click)="deleteProfile()">
                                        Wipe Profile Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                </form>
            </main>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-border bg-background/50 backdrop-blur-sm flex gap-3">
             <button hlmBtn variant="outline" size="lg" (click)="uiService.closeProfileSettings()"
                class="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-border text-muted-foreground hover:bg-muted transition-all">
                Cancel
            </button>
            <button hlmBtn size="lg" (click)="save()" [disabled]="isLoading()"
                class="flex-2 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-[10px] transition-all border-0 shadow-lg shadow-primary/10">
                @if(isLoading()) {
                    <ng-icon name="lucideLoader2" class="animate-spin mr-2 h-4 w-4"></ng-icon>
                    Synchronizing...
                } @else {
                    <ng-icon name="lucideSave" class="mr-2 h-4 w-4"></ng-icon>
                    Commit Changes
                }
            </button>
        </div>
    </hlm-sheet-content>
</hlm-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsSheetComponent {
    private fb = inject(FormBuilder);
    public themeService = inject(ThemeService);
    public uiService = inject(UiStateService);
    private profileStore = inject(ProfileStore);

    constructor() {
        effect(() => {
            const profile = this.profileStore.profile();
            if (profile) {
                this.form.patchValue({
                    email: profile.email
                });
            }
        });
    }

    // Navigation State
    activeSection = signal<'intelligence' | 'connectivity' | 'preferences' | 'security'>('intelligence');

    navItems: { id: 'intelligence' | 'connectivity' | 'preferences' | 'security', label: string, sub: string, icon: string }[] = [
        { id: 'intelligence', label: 'Intelligence', sub: 'Neural Config', icon: 'lucideBrain' },
        { id: 'connectivity', label: 'Connectivity', sub: 'Signal Bridges', icon: 'lucideLink' },
        { id: 'preferences', label: 'Preferences', sub: 'Environment', icon: 'lucideSettings' },
        { id: 'security', label: 'Security & Data', sub: 'Identity Core', icon: 'lucideShield' }
    ];

    aiTones = ['Professional', 'Aggressive', 'Mentor'];

    themeOptions: { id: Theme, label: string, icon: string, previewClass: string }[] = [
        { id: 'light', label: 'Paper', icon: 'lucideGlobe', previewClass: 'bg-zinc-100 text-zinc-900 border border-zinc-200' },
        { id: 'dark', label: 'Obsidian', icon: 'lucideGlobe', previewClass: 'bg-zinc-950 text-zinc-100 border border-zinc-800' },
        { id: 'system', label: 'System', icon: 'lucideLaptop', previewClass: 'bg-linear-to-br from-zinc-100 to-zinc-950 border border-zinc-400' }
    ];

    // Forms
    form = this.fb.group({
        email: [{ value: '', disabled: true }],
        password: ['', [Validators.minLength(8)]],
        linkedInToken: [''],
        openAiKey: [''],
        geminiKey: [''],
        aiTone: ['Professional'],
        deepSearch: [false],
        googleCalendarConnected: [false],
        currency: ['USD'],
        salaryPeriod: ['Yearly'],
        language: ['English'],
        jobBoards: this.fb.array([])
    });

    // State
    isLoading = signal(false);

    ngOnChanges() {
        // Handled by effect
    }

    open() {
        this.uiService.openProfileSettings();
    }

    close() {
        this.uiService.closeProfileSettings();
    }

    setTheme(theme: Theme) {
        this.themeService.setTheme(theme);
    }

    toggleConnection(field: string) {
        const control = this.form.get(field);
        if (control) {
            control.setValue(!control.value);
            toast.info(control.value ? 'Link Established' : 'Signal Terminated', {
                description: `${field === 'googleCalendarConnected' ? 'Google Calendar' : field} status updated.`
            });
        }
    }

    isJobBoardChecked(board: string): boolean {
        const boards = this.form.get('jobBoards')?.value as string[];
        return boards.includes(board);
    }

    toggleJobBoard(board: string) {
        const boardsControl = this.form.get('jobBoards');
        if (boardsControl) {
            const currentBoards = boardsControl.value as string[];
            if (currentBoards.includes(board)) {
                boardsControl.setValue(currentBoards.filter(b => b !== board));
            } else {
                boardsControl.setValue([...currentBoards, board]);
            }
        }
    }

    exportDossier() {
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: 'Generating encrypted dossier...',
            success: 'Dossier Downloaded',
            error: 'Transmition Failed'
        });
    }

    deleteProfile() {
        if (confirm('CRITICAL: This will permanently wipe your profile. Continue?')) {
            toast.error('Identity Purged', { description: 'All records have been erased from the neural core.' });
            this.close();
        }
    }

    save() {
        this.isLoading.set(true);
        // Mock save logic
        setTimeout(() => {
            this.isLoading.set(false);
            toast.success('System Overwritten', {
                description: 'Core parameters have been synchronized across all sectors.',
                // icon: 'lucideCheck' // Removed: Type string is not assignable to Type<unknown>
            });
            this.close();
        }, 1500);
    }
}
