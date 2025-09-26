import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from '../../core/services/book';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './book-form.html',
  styleUrls: ['./book-form.scss']
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode = false;
  bookId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private snackBar: MatSnackBar
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      read: [false]
    });
  }

  ngOnInit() {
    this.bookId = Number(this.route.snapshot.params['id']);
    this.isEditMode = !!this.bookId;
    
    if (this.isEditMode && this.bookId) {
      this.loadBook(this.bookId);
    }
  }

  loadBook(id: number) {
    this.bookService.getBookById(id).subscribe({
      next: book => this.bookForm.patchValue(book),
      error: () => {
        this.snackBar.open('Failed to load book', 'Close', { duration: 3000 });
        this.router.navigate(['/books']);
      }
    });
  }

  onSubmit() {
    if (this.bookForm.valid) {
      const book = this.bookForm.value;
      
      if (this.isEditMode && this.bookId) {
        this.bookService.updateBook(this.bookId, book).subscribe({
          next: () => {
            this.snackBar.open('Book updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/books']);
          },
          error: () => this.snackBar.open('Failed to update book', 'Close', { duration: 3000 })
        });
      } else {
        this.bookService.addBook(book).subscribe({
          next: () => {
            this.snackBar.open('Book added successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/books']);
          },
          error: () => this.snackBar.open('Failed to add book', 'Close', { duration: 3000 })
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['/books']);
  }
}
