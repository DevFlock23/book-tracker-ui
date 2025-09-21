import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../core/services/book';
import { Book } from '../../models/Book';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSnackBarModule],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.scss']
})
export class BookDetailComponent {
  book: Book | null = null;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadBook(id);
    });
  }

  loadBook(id: number) {
    this.bookService.getBook(id).subscribe({
      next: book => (this.book = book),
      error: () => {
        this.snack.open('Failed to load book details', 'Close', { duration: 3000 });
        this.router.navigate(['/books']);
      }
    });
  }
}
