import { Component, ChangeDetectionStrategy, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideMail, lucideLock, lucideKey, lucideX, lucideCheck, lucideLoader2, lucideSave } from '@ng-icons/lucide';
import { toast } from 'ngx-sonner';
import { UserProfile } from '../../models/profile.model';

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
        NgIcon,
    ],
    providers: [
        provideIcons({
            lucideSettings, lucideMail, lucideLock, lucideKey,
            lucideX, lucideCheck, lucideLoader2, lucideSave
        })
    ],
    template: `
<hlm-sheet side="right" class="border-l border-border" [state]="isOpen() ? 'open' : 'closed'" (closed)="close()">
    <hlm-sheet-content *brnSheetContent="let ctx"
        class="w-full sm:max-w-md bg-background border-l border-border p-0 shadow-2xl flex flex-col h-full">

        <!-- Header -->
        <hlm-sheet-header class="px-8 pt-8 pb-4 space-y-2 border-b border-border/50 bg-muted/20">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                    <ng-icon name="lucideSettings" class="h-5 w-5"></ng-icon>
                </div>
                <div>
                    <h3 hlmSheetTitle class="text-xl font-serif text-foreground tracking-tight">Configuration</h3>
                    <p hlmSheetDescription class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Parameters</p>
                </div>
            </div>
        </hlm-sheet-header>

        <!-- Content -->
        <div class="flex-1 px-8 py-6 space-y-8 overflow-y-auto">
            <form [formGroup]="form" class="space-y-8">
                <!-- Credentials Section -->
                <section class="space-y-4">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity Credentials</h4>
                    
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label hlmLabel class="text-xs font-bold text-muted-foreground">Email Address</label>
                            <div class="relative">
                                <ng-icon name="lucideMail" class="absolute left-3 top-3 text-muted-foreground h-4 w-4"></ng-icon>
                                <input hlmInput formControlName="email" readonly
                                    class="pl-10 bg-muted/30 border-border text-muted-foreground cursor-not-allowed rounded-xl h-11 w-full" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label hlmLabel class="text-xs font-bold text-muted-foreground">New Password</label>
                            <div class="relative">
                                <ng-icon name="lucideLock" class="absolute left-3 top-3 text-muted-foreground h-4 w-4"></ng-icon>
                                <input hlmInput type="password" formControlName="password"
                                    class="pl-10 bg-muted border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                    placeholder="••••••••" />
                            </div>
                        </div>
                    </div>
                </section>

                <div class="h-px bg-border"></div>

                <!-- API Keys Section -->
                <section class="space-y-4">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tactical API Keys</h4>
                    
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label hlmLabel class="text-xs font-bold text-muted-foreground">LinkedIn Personal Access Token</label>
                            <div class="relative">
                                <ng-icon name="lucideKey" class="absolute left-3 top-3 text-muted-foreground h-4 w-4"></ng-icon>
                                <input hlmInput type="password" formControlName="linkedInToken"
                                    class="pl-10 bg-muted border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                    placeholder="Bearer eyJhbGci..." />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label hlmLabel class="text-xs font-bold text-muted-foreground">OpenAI Key (Personal)</label>
                            <div class="relative">
                                <ng-icon name="lucideKey" class="absolute left-3 top-3 text-muted-foreground h-4 w-4"></ng-icon>
                                <input hlmInput type="password" formControlName="openAiKey"
                                    class="pl-10 bg-muted border-border text-foreground focus:border-primary/50 rounded-xl h-11 w-full"
                                    placeholder="sk-..." />
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-border bg-background/50 backdrop-blur-sm">
            <button hlmBtn size="lg" (click)="save()" [disabled]="isLoading()"
                class="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs transition-all border-0">
                @if(isLoading()) {
                    <ng-icon name="lucideLoader2" class="animate-spin mr-2 h-4 w-4"></ng-icon>
                    Syncing...
                } @else {
                    <ng-icon name="lucideSave" class="mr-2 h-4 w-4"></ng-icon>
                    Save Changes
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

    profile = input<UserProfile | null>(null);

    // Forms
    form = this.fb.group({
        email: [{ value: '', disabled: true }],
        password: ['', [Validators.minLength(8)]],
        linkedInToken: [''],
        openAiKey: ['']
    });

    // State
    isOpen = signal(false);
    isLoading = signal(false);

    ngOnChanges() {
        if (this.profile()) {
            this.form.patchValue({
                email: this.profile()!.email
            });
        }
    }

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    save() {
        this.isLoading.set(true);
        // Mock save logic
        setTimeout(() => {
            this.isLoading.set(false);
            toast.success('System Updated', { description: 'Settings have been synced to the core.' });
            this.close();
        }, 1000);
    }
}
