import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.debug('[LoginComponent] login() username ->', this.username);
    this.authService.login(this.username).subscribe({
      next: token => {
        console.debug('[LoginComponent] received token ->', token);
        this.authService.saveToken(token);
        console.debug('[LoginComponent] token saved, navigating to home');
        this.router.navigate(['/books']); // Redirect to the book list after login
      },
      error: (err) => {
        console.error('[LoginComponent] login failed ->', err);
        alert('Login failed!');
      }
    });
  }
}
