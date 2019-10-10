import { Component, AfterViewInit } from '@angular/core';
import {CommunityDetailsService} from "../core/services/community-details.service";


@Component({
  selector: 'ds-footer',
  styleUrls: ['footer.component.scss'],
  templateUrl: 'footer.component.html'
})
export class FooterComponent implements AfterViewInit{
	message : string;

  	dateObj: number = Date.now();
	
	constructor(
	private data: CommunityDetailsService
	){
	}
	
	ngAfterViewInit() {
    	this.data.currentMessage.subscribe((message) => this.message = message);    
  	}
}
