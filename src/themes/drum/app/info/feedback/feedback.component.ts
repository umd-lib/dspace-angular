import { Component } from '@angular/core';
import { FeedbackComponent as BaseComponent } from 'src/app/info/feedback/feedback.component';
import { ThemedFeedbackFormComponent } from 'src/app/info/feedback/feedback-form/themed-feedback-form.component';

@Component({
  selector: 'ds-themed-feedback',
  styleUrls: ['./feedback.component.scss'],
  templateUrl: './feedback.component.html',
  imports: [ThemedFeedbackFormComponent],
  standalone: true,
})

/**
 * Component displaying the feedback Statement
 */
export class FeedbackComponent extends BaseComponent { }
