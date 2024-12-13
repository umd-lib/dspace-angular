import { Component } from '@angular/core';
import { FeedbackComponent as BaseComponent } from 'src/app/info/feedback/feedback.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';

@Component({
  selector: 'ds-feedback',
  styleUrls: ['./feedback.component.scss'],
  templateUrl: './feedback.component.html',
  imports: [FeedbackFormComponent],
  standalone: true,
})

/**
 * Component displaying the feedback Statement
 */
export class FeedbackComponent extends BaseComponent { }
