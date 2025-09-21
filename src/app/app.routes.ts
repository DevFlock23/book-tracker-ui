import { Routes } from '@angular/router';
import { BookListComponent } from './books/book-list/book-list';
import { BookDetailComponent } from './books/book-detail/book-detail';
import { BookFormComponent } from './books/book-form/book-form';
import { LoginComponent } from './login/login';
import { AuthGuard } from './core/guards/AuthGuard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: BookListComponent, canActivate: [AuthGuard] },
  { path: 'books', component: BookListComponent, canActivate: [AuthGuard] },
  { path: 'books/new', component: BookFormComponent, canActivate: [AuthGuard] },
  { path: 'books/:id', component: BookDetailComponent, canActivate: [AuthGuard] },
  { path: 'books/:id/edit', component: BookFormComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
