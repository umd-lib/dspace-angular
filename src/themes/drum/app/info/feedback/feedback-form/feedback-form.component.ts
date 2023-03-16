import { Component } from '@angular/core';

@Component({
  selector: 'ds-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
/**
 * DRUM relies on a Wufoo form for generating feedback, so this component
 * has been stripped of its DSpace form building functionality, as it is
 * not used.
 *
 * The WufooFeedbackResolver is responsible for generating the form default
 * values, and redirecting to the Wufoo form URL.
 */
export class FeedbackFormComponent {
}
