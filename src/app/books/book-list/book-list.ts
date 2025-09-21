import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../core/services/book';
import { MatTableDataSource } from '@angular/material/table';
import { Book } from '../../models/Book';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/AuthService';

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
    RouterModule
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent implements AfterViewInit {
  displayedColumns = ['title', 'author', 'read', 'actions'];
  dataSource = new MatTableDataSource<Book>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private bookService: BookService, 
              private snack: MatSnackBar, 
              private authService: AuthService) {}

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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
