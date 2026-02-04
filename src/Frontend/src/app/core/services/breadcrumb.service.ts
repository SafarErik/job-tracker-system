import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
    label: string;
    url: string;
}

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);

    private lastWorkstationTab = signal<string>('overview');
    private lastApplicationId = signal<string | null>(null);

    // Dynamic breadcrumbs signal
    readonly breadcrumbs = signal<Breadcrumb[]>([]);

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            const root = this.activatedRoute.root;
            this.breadcrumbs.set(this.createBreadcrumbs(root));
        });
    }

    setLastWorkstationState(applicationId: string, tab: string) {
        this.lastApplicationId.set(applicationId);
        this.lastWorkstationTab.set(tab);
    }

    getLastWorkstationLink() {
        const id = this.lastApplicationId();
        const tab = this.lastWorkstationTab();
        return id ? `/applications/${id}?tab=${tab}` : '/applications';
    }

    getLastWorkstationTab() {
        return this.lastWorkstationTab();
    }

    private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'];
            if (label) {
                breadcrumbs.push({ label, url });
            }

            return this.createBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }
}
