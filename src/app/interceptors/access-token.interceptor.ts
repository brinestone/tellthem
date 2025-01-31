import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Navigate } from '@ngxs/router-plugin';
import { Store } from '@ngxs/store';
import { catchError, concatMap, EMPTY, throwError } from 'rxjs';
import { accessToken, RefreshAccessToken } from '../state/user';
import { environment } from '@env/environment.development';

export const accessTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const token = store.selectSnapshot(accessToken);

  if (req.url.startsWith('/api') && token) {
    return next(req.clone({ setHeaders: { 'Authorization': `Bearer ${token}` } })).pipe(
      catchError((e: HttpErrorResponse) => {
        if (e.status == 401 && req.url != environment.apiOrigin + '/auth/revoke-token')
          return store.dispatch(RefreshAccessToken).pipe(
            concatMap(() => next(req.clone({ setHeaders: { authorization: `Bearer ${store.selectSnapshot(accessToken)}` } }))),
            catchError((e: HttpErrorResponse) => {
              if (e.status == 403) {
                store.dispatch(new Navigate(['/auth/login'], undefined, { queryParamsHandling: 'preserve' }))
                return EMPTY;
              }
              return throwError(() => e);
            })
          );
        return throwError(() => e);
      })
    );
  }
  return next(req);
};
