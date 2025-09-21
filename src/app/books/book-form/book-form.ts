import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BookService } from '../../core/services/book';
import { Book } from '../../models/Book';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './book-form.html',
  styleUrls: ['./book-form.scss']
})
export class BookFormComponent {
  bookForm: FormGroup;
  isEditMode = false;
  bookId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      read: [false, Validators.required],
      //description: [''],
      //publishedDate: ['', Validators.required],
      //status: ['to-read', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bookId = +params['id'];
        this.loadBook(this.bookId);
      }
    });
  }

  loadBook(id: number) {
    this.bookService.getBook(id).subscribe({
      next: book => this.bookForm.patchValue(book),
      error: () => this.snack.open('Failed to load book details', 'Close', { duration: 3000 })
    });
  }

  onSubmit() {
    if (this.bookForm.invalid) return;

    const book: Book = this.bookForm.value;
    if (this.isEditMode && this.bookId) {
      this.bookService.updateBook(this.bookId, book).subscribe({
        next: () => {
          this.snack.open('Book updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/books']);
        },
        error: () => this.snack.open('Failed to update book', 'Close', { duration: 3000 })
      });
    } else {
      this.bookService.createBook(book).subscribe({
        next: () => {
          this.snack.open('Book created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/books']);
        },
        error: () => this.snack.open('Failed to create book', 'Close', { duration: 3000 })
      });
    }
  }
}
