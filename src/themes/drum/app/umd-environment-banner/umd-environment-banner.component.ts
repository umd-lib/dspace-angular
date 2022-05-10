import { Component, Inject, OnInit } from '@angular/core';
import { AppConfig, APP_CONFIG } from 'src/config/app-config.interface';
@Component({
  selector: 'ds-umd-environment-banner',
  templateUrl: './umd-environment-banner.component.html',
  styleUrls: ['./umd-environment-banner.component.scss']
})
export class UmdEnvironmentBannerComponent implements OnInit {
  bannerText: string = '';
  bannerEnabled = false;
  bannerStyle = {};

  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig) {
  }

  ngOnInit(): void {
    let bannerConfig = this.appConfig['environmentBanner'];

    this.bannerText = bannerConfig.text
    this.bannerEnabled = bannerConfig.enabled;

    this.bannerStyle = { 'color': bannerConfig.foregroundColor, 'background-color': bannerConfig.backgroundColor };
  }
}
