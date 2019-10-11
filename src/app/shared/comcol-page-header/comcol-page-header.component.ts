import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommunityDetailsService } from '../../core/services/community-details.service';


@Component({
  selector: 'ds-comcol-page-header',
  styleUrls: ['./comcol-page-header.component.scss'],
  templateUrl: './comcol-page-header.component.html',
})
export class ComcolPageHeaderComponent {
  @Input() name: string;
  @ViewChild('check') check: ElementRef;
  
  constructor(
    private data:CommunityDetailsService
  ){
    
  }

  message : string;
  
  ngAfterViewInit() {
    this.data.changeMessage(this.check.nativeElement.innerHTML);
  }
}
