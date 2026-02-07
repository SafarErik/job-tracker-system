import { Pipe, PipeTransform } from '@angular/core';
import { JobType } from '../models/job-type.enum';

@Pipe({
    name: 'jobType',
    standalone: true
})
export class JobTypePipe implements PipeTransform {
    transform(value: JobType | number | undefined): string {
        if (value === undefined) return 'N/A';

        switch (value) {
            case JobType.FullTime: return 'Full-Time';
            case JobType.PartTime: return 'Part-Time';
            case JobType.Internship: return 'Internship';
            case JobType.Contract: return 'Contract';
            case JobType.Freelance: return 'Freelance';
            default: return 'N/A';
        }
    }
}
