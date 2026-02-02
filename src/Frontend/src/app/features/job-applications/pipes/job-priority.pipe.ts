import { Pipe, PipeTransform } from '@angular/core';
import { JobPriority } from '../models/job-priority.enum';

@Pipe({
    name: 'jobPriority',
    standalone: true
})
export class JobPriorityPipe implements PipeTransform {
    transform(value: JobPriority | number | undefined): string {
        if (value === undefined) return 'N/A';

        switch (value) {
            case JobPriority.Low: return 'Low';
            case JobPriority.Medium: return 'Medium';
            case JobPriority.High: return 'High';
            default: return 'N/A';
        }
    }
}
