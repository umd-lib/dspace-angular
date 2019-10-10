import {BehaviorSubject, Subject, Observable} from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class CommunityDetailsService {

  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  changeMessage(message: string) {
    this.messageSource.next(message);
  }

  private subject = new Subject<any>();

    sendMessage(message: string) {
        this.subject.next({ text: message });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

}
