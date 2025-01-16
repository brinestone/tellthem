import { DatePipe, NgPlural, NgPluralCase } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, model, ResourceRef, signal } from '@angular/core';
import {
  rxResource
} from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CampaignFormComponent
} from '@app/components/campaign-form/campaign-form.component';
import { LookupCampaignResponse } from '@lib/models/campaign';
import { Category } from '@lib/models/category';
import {
  CountryData
} from '@lib/models/country-data';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { Button } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { Drawer } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'tm-campaigns',
  imports: [
    TableModule,
    Button,
    InputText,
    IconField,
    InputIcon,
    Drawer,
    ReactiveFormsModule,
    DatePipe,
    Panel,
    DataViewModule,
    CampaignFormComponent,
    NgPlural,
    NgPluralCase,
    RouterLink,
    Ripple
  ],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  showCampaignModal = model(false);
  showPublicationModal = model(false);
  currentPage = model(0);
  currentPageSize = model(20);
  readonly tokens = signal(0);

  readonly categories = rxResource({
    loader: () => this.http.get<Category[]>('/api/categories')
  });
  readonly countries = rxResource({
    loader: () => this.http.get<CountryData[]>('/api/countries')
  });

  readonly campaigns: ResourceRef<LookupCampaignResponse> = rxResource({
    request: () => ({ page: this.currentPage(), size: this.currentPageSize() }),
    loader: ({ request: { page, size } }) => this.http.get<LookupCampaignResponse>('/api/campaigns', {
      params: {
        page,
        size
      }
    })
  });

  onCampaignFormSubmitted() {
    this.campaigns.reload();
    this.showCampaignModal.set(false);
  }

  onCampaignFormErrored(error: Error) {
    const message: ToastMessageOptions = {
      summary: 'Error',
      detail: error.message,
      severity: 'error',
    };
    if (this.showCampaignModal()) {
      message.key = 'under-modal';
    }
    this.messageService.add(message);
  }

  constructor() {
    effect(() => {
      const fetchError = this.categories.error();
      if (!fetchError) return;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: (fetchError as Error).message,
      })
    });
  }

  onPublicationFormSubmitted() {
    this.showPublicationModal.set(false);
  }
}
