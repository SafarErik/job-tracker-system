import { Directive } from '@angular/core';
import { classes } from '../../../utils/src';

@Directive({
	selector: '[hlmAlertDialogHeader],hlm-alert-dialog-header',
	host: {
		'data-slot': 'alert-dialog-header',
	},
})
export class HlmAlertDialogHeader {
	constructor() {
		classes(() => 'flex flex-col gap-2 text-center sm:text-start');
	}
}
