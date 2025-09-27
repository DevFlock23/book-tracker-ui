import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { CFTableComponent, CFTableConfig } from '../../UIComponents/CF-Table/CF-Table';
import { BookService } from '../../core/services/book';
import { AuthService } from '../../core/services/AuthService';
import { Book } from '../../models/Book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule,
    CFTableComponent
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading = false;

  tableConfig: CFTableConfig = {
    columns: [
      { key: 'title', label: 'Title', width: 200, minWidth: 150 },
      { key: 'author', label: 'Author', width: 150, minWidth: 120 },
      { key: 'read', label: 'Status', width: 140, minWidth: 120, type: 'custom' },
      { key: 'actions', label: 'Actions', width: 160, minWidth: 140, type: 'custom' }
    ],
    showSearch: true,
    searchPlaceholder: 'Search by title or author',
    showPagination: true,
    pageSizeOptions: [5, 10, 20],
    height: '500px'
  };

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

  customTemplates: { [key: string]: TemplateRef<any> } = {};

  constructor(
    private bookService: BookService, 
    private snack: MatSnackBar, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Set up custom templates
    setTimeout(() => {
      this.customTemplates = {
        'read': this.statusTemplate,
        'actions': this.actionsTemplate
      };
    });

    const token = this.authService.getToken();
    if (!token) {
      this.snack.open('Please log in to access books', 'Close', { duration: 3000 });
      return;
    }

    this.loadBooks();
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getBooks(0, 100).subscribe({
      next: res => {
        console.log('[BookListComponent] Loaded books:', res.content);
        this.books = res.content;
        this.loading = false;
      },
      error: () => {
        this.snack.open('Failed to load books', 'Close', { duration: 3000 });
        this.loading = false;
      }
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

  onTableAction(event: {action: string, row: any}) {
    switch(event.action) {
      case 'delete':
        this.deleteBook(event.row.id);
        break;
    }
  }
}