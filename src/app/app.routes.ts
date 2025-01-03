import { Routes }                                     from '@angular/router';
import { authGuard }                                  from './guards/auth.guard';
import { provideUserState, USER }                     from './state/user';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { NotFoundComponent }                          from './pages/not-found/not-found.component';

const userState = provideUserState(withStorageFeature([
  { key: USER, engine: SESSION_STORAGE_ENGINE }
]));

const signedInGuard = authGuard('/auth/login');

export const appRoutes: Routes = [
  {
    providers: [userState],
    path: 'auth',
    loadChildren: () => import('./auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'campaigns',
    canActivate: [signedInGuard],
    providers: [userState],
    loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent),
    title: 'Campaigns'
  },
  {
    providers: [userState],
    canActivate: [signedInGuard],
    title: 'Dashboard',
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: '**', component: NotFoundComponent, title: '404 - Resource not found' }
];
