import { Component, effect, inject, model, ResourceRef } from '@angular/core';
import { TableModule }                                   from 'primeng/table';
import { Button }                                        from 'primeng/button';
import { InputText }                                     from 'primeng/inputtext';
import { IconField }                                     from 'primeng/iconfield';
import { InputIcon }                                     from 'primeng/inputicon';
import { Drawer }                                        from 'primeng/drawer';
import { ReactiveFormsModule }                           from '@angular/forms';
import { DatePipe }                                      from '@angular/common';
import { MessageService }                                from 'primeng/api';
import { rxResource }                                    from '@angular/core/rxjs-interop';
import { CountryData }                                   from '@lib/country-data';
import { Category }                                      from '@lib/category';
import { HttpClient }                                    from '@angular/common/http';
import { Campaign, LookupCampaignResponse }              from '@lib/campaign';
import { Panel }                                         from 'primeng/panel';
import { Menu }                                          from 'primeng/menu';
import { DataViewModule }                                from 'primeng/dataview';
import { CampaignFormComponent }                         from '@app/components/campaign-form/campaign-form.component';
import {
  CampaignPublicationsComponent
}                                                        from '@app/components/campaign-publications/campaign-publications.component';

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
    Menu,
    DataViewModule,
    CampaignFormComponent,
    CampaignPublicationsComponent
  ],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  readonly selectedCampaign = model<Campaign>();
  showNewCampaignModal = model(false);
  currentPage = model(0);
  currentPageSize = model(20);

  readonly categories = rxResource({
    loader: () => this.http.get<Category[]>('/api/categories')
  });
  readonly countries = rxResource({
    loader: () => this.http.get<CountryData[]>('/api/countries/all')
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
    this.showNewCampaignModal.set(false);
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
}
