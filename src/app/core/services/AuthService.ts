import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = '/api/auth/login'; // Update with your API URL

  constructor(private http: HttpClient) {}

  login(username: string): Observable<string> {
    console.debug('[AuthService] login() request ->', this.authApi, { username });
    return this.http.post(this.authApi, null, {
      params: { username },
      responseType: 'text' as 'text' // The API returns the token as plain text
    }).pipe(
      tap(
        token => console.debug('[AuthService] login() response token ->', token),
        err => console.error('[AuthService] login() error ->', err)
      )
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
}