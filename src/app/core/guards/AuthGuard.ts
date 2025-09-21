import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    console.debug('[AuthGuard] Token:', token);

    if (token && !this.isTokenExpired(token)) {
      console.debug('[AuthGuard] Token is valid');
      return true;
    } else {
      console.debug('[AuthGuard] Token is invalid or expired');
      this.router.navigate(['/login']);
      return false;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.debug('[AuthGuard] Token payload:', payload);
      const isExpired = payload.exp * 1000 < Date.now();
      console.debug('[AuthGuard] Token expiration status:', isExpired);
      return isExpired;
    } catch (error) {
      console.error('[AuthGuard] Failed to parse token:', error);
      return true;
    }
  }
}