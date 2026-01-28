import { Directive, input } from '@angular/core';
import { classes } from '../../../utils/src';
import { type VariantProps, cva } from 'class-variance-authority';

const alertVariants = cva(
	'relative w-full items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>[hlmAlertIcon]]:grid has-[>[hlmAlertIcon]]:grid-cols-[calc(theme(spacing.1)*4)_1fr] has-[>[hlmAlertIcon]]:gap-x-3 [&>[hlmAlertIcon]]:size-4 [&>[hlmAlertIcon]]:translate-y-0.5 [&>[hlmAlertIcon]]:text-current',
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive:
					'text-destructive border-destructive/50 dark:border-destructive [&>[hlmAlertIcon]]:text-destructive',
				success: 'text-green-600 border-green-500/50 dark:border-green-500 [&>[hlmAlertIcon]]:text-green-600',
				warning: 'text-yellow-600 border-yellow-500/50 dark:border-yellow-500 [&>[hlmAlertIcon]]:text-yellow-600',
				info: 'text-blue-600 border-blue-500/50 dark:border-blue-500 [&>[hlmAlertIcon]]:text-blue-600',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export type AlertVariants = VariantProps<typeof alertVariants>;

@Directive({
	selector: '[hlmAlert]',
	host: {
		role: 'alert',
	},
})
export class HlmAlert {
	public readonly variant = input<AlertVariants['variant']>('default');

	constructor() {
		classes(() => alertVariants({ variant: this.variant() }));
	}
}
