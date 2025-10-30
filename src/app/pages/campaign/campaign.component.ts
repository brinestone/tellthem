import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Component, computed, effect, inject } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CampaignAnalytics } from "@app/components/campaign-analytics/campaign-analytics.component";
import { CampaignPublications } from "@app/components/campaign-publications/campaign-publications.component";
import { CampaignSettings } from "@app/components/campaign-settings/campaign-settings.component";
import { environment } from "@env/environment.development";
import { Campaign } from "@lib/models/campaign";
import { Navigate } from "@ngxs/router-plugin";
import { dispatch } from "@ngxs/store";
import { injectParams } from "ngxtension/inject-params";
import { injectQueryParams } from "ngxtension/inject-query-params";
import { MessageService } from "primeng/api";
import { Button } from "primeng/button";
import { Panel } from "primeng/panel";
import { ProgressSpinner } from "primeng/progressspinner";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "primeng/tabs";
import { EMPTY } from "rxjs";

@Component({
  selector: "tm-campaign",
  imports: [
    Tabs,
    TabList,
    Tab,
    CampaignAnalytics,
    Button,
    CampaignPublications,
    CampaignSettings,
    TabPanel,
    ProgressSpinner,
    TabPanels,
    Panel,
    RouterLink,
  ],
  templateUrl: "./campaign.component.html",
  styleUrl: "./campaign.component.scss",
})
export class CampaignComponent {
  private http = inject(HttpClient);
  private ms = inject(MessageService);
  private navigate = dispatch(Navigate);
  readonly currentRoute = inject(ActivatedRoute);
  readonly tabParam = injectQueryParams("activeTab", {
    initialValue: "analytics",
  });
  readonly activeTabIndex = computed(() => {
    const tabParam = this.tabParam();
    switch (tabParam) {
      default:
      case "general":
        return 0;
      case "publications":
        return 1;
      case "settings":
        return 2;
    }
  });
  readonly campaignId = injectParams("campaign");
  readonly campaign = rxResource({
    request: () => this.campaignId(),
    loader: ({ request }) => {
      if (!request) return EMPTY;
      return this.http.get<Campaign>(
        `${environment.apiOrigin}/campaign/${request}`,
      );
    },
  });

  onSettingsErrored(event: Error) {
    this.ms.add({
      summary: "Error",
      severity: "error",
      detail: event.message,
    });
  }

  onCampaignUpdated() {
    this.campaign.reload();
    this.ms.add({
      summary: "Notification",
      severity: "success",
      detail: "Changes saved",
    });
  }

  onCampaignDeleted() {
    this.navigate([".."], undefined, { relativeTo: this.currentRoute });
  }

  constructor(title: Title) {
    effect(() => {
      const campaign = this.campaign.value();
      const error = this.campaign.error();

      if (error) {
        const e = error as HttpErrorResponse;
        if (e.status == 404)
          this.navigate([".."], undefined, { relativeTo: this.currentRoute });
      }
      if (campaign) {
        title.setTitle(campaign.title + " | " + title.getTitle());
      }
    });
  }
}
