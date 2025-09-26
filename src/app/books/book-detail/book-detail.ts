import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookService } from '../../core/services/book';
import { Book } from '../../models/Book';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.scss']
})
export class BookDetailComponent implements OnInit {
  book?: Book;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    this.loadBook(id);
  }

  loadBook(id: number) {
    this.bookService.getBookById(id).subscribe({
      next: book => {
        this.book = book;
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/books']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/books']);
  }
}
