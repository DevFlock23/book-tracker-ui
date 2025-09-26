import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { BookService } from '../../core/services/book';
import { AuthService } from '../../core/services/AuthService';
import { Book } from '../../models/Book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent implements AfterViewInit {
  displayedColumns = ['title', 'author', 'read', 'actions'];
  dataSource = new MatTableDataSource<Book>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private bookService: BookService, 
    private snack: MatSnackBar, 
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    const token = this.authService.getToken();
    if (!token) {
      this.snack.open('Please log in to access books', 'Close', { duration: 3000 });
      return;
    }

    this.dataSource.paginator = this.paginator;
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getBooks(0, 100).subscribe({
      next: res => {
        console.log('[BookListComponent] Loaded books:', res.content);
        this.dataSource.data = res.content;
      },
      error: () => this.snack.open('Failed to load books', 'Close', { duration: 3000 })
    });
  }

  deleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.snack.open('Book deleted successfully', 'Close', { duration: 3000 });
          this.loadBooks();
        },
        error: () => this.snack.open('Failed to delete book', 'Close', { duration: 3000 })
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
