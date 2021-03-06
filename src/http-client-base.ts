import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';

import { environment } from './environment';
import { IAccount } from './account';

export interface IQueryParams {
  [other: string]: any;
}

export class HttpClientBase {

  constructor(
    public http: HttpClient,
    public router: Router,
    public resourceUrl: string,
    public apiVersion?: string
  ) {
    const version = apiVersion ? apiVersion : environment.apiVersion;
    this.resourceUrl = `${environment.apiUrl}/${apiVersion}/${this.resourceUrl}`;
  }

  clearLocalStorage() {
    localStorage.removeItem(environment.userKey);
  }

  getAccessToken(): string {
    let user = <IAccount>null;
    try {
      user = JSON.parse(localStorage.getItem(environment.userKey) || '{}');
    }
    catch (error) {
      console.log(error);
    }

    return user ? user.accessToken : null;
  }

  getAuthorizationHeaders(): any {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  getRequestOptions(
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  } {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (!excludeAuthenticationHeaders) {
      Object.assign(headers, this.getAuthorizationHeaders());
    }

    return {
      headers: new HttpHeaders(headers),
      params: new HttpParams({
        fromObject: queryParams
      }),
      responseType: 'json'
    };
  }

  // error processing
  handleError(error: HttpErrorResponse) {
    // authentication or forbidden error
    if (error.status === 401 || error.status === 403) {
      const state = error.status === 401 ? '/login' : '/unauthorized';
      this.displayError(error);
      this.clearLocalStorage();
      this.router.navigate([state]);
    }

    return new ErrorObservable(error);
  }

  displayError(error: HttpErrorResponse) {
    console.log(`${error.name}: ${error.message}`);
  }

  get<T>(
    queryParams?: IQueryParams,
    resourcePath?: string,
    excludeAuthenticationHeaders = false
  ): Observable<T> {
    const reqOpts = this.getRequestOptions(queryParams, excludeAuthenticationHeaders);
    return this.http.get<T>(`${this.resourceUrl + resourcePath}`, reqOpts)
      .pipe(catchError(error => this.handleError(error)));
  }

  async getAsync<T>(
    queryParams?: any,
    resourcePath?: string,
    excludeAuthenticationHeaders = false
  ): Promise<T> {
    return this.get<T>(queryParams, resourcePath, excludeAuthenticationHeaders).toPromise();
  }

  post<T>(
    body?: IQueryParams,
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Observable<T> {
    const reqOpts = this.getRequestOptions(queryParams, excludeAuthenticationHeaders);
    return this.http.post<T>(`${this.resourceUrl + resourcePath}`, body, reqOpts)
      .pipe(catchError(error => this.handleError(error)));
  }

  async postAsync<T>(
    body?: IQueryParams,
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Promise<T> {
    return this.post<T>(body, resourcePath, queryParams, excludeAuthenticationHeaders).toPromise();
  }

  put<T>(
    body?: IQueryParams,
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Observable<T> {
    const reqOpts = this.getRequestOptions(queryParams, excludeAuthenticationHeaders);
    return this.http.put<T>(`${this.resourceUrl + resourcePath}`, body, reqOpts)
      .pipe(catchError(error => this.handleError(error)));
  }

  async putAsync<T>(
    body?: IQueryParams,
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Promise<T> {
    return this.put<T>(body, resourcePath, queryParams, excludeAuthenticationHeaders).toPromise();
  }

  delete<T>(
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Observable<T> {
    const reqOpts = this.getRequestOptions(queryParams, excludeAuthenticationHeaders);
    return this.http.delete<T>(`${this.resourceUrl + resourcePath}`, reqOpts)
      .pipe(catchError(error => this.handleError(error)));
  }

  async deleteAsync<T>(
    resourcePath?: string,
    queryParams?: IQueryParams,
    excludeAuthenticationHeaders = false
  ): Promise<any> {
    return this.delete<T>(resourcePath, queryParams, excludeAuthenticationHeaders).toPromise();
  }
}
