import { NgIf } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  APP_CONFIG,
  AppConfig,
} from 'src/config/app-config.interface';

@Component({
  selector: 'ds-umd-environment-banner',
  templateUrl: './umd-environment-banner.component.html',
  styleUrls: ['./umd-environment-banner.component.scss'],
  imports: [NgIf],
  standalone: true,
})
export class UmdEnvironmentBannerComponent implements OnInit {
  bannerText = '';
  bannerEnabled = false;
  bannerStyle = {};

  constructor(@Inject(APP_CONFIG) private appConfig: AppConfig) {
  }

  ngOnInit(): void {
    const bannerConfig = this.appConfig['environmentBanner']; // eslint-disable-line @typescript-eslint/dot-notation

    this.bannerText = bannerConfig?.text;
    this.bannerEnabled = bannerConfig?.enabled;
    this.bannerStyle = { 'color': bannerConfig?.foregroundColor, 'background-color': bannerConfig?.backgroundColor };
  }
}
