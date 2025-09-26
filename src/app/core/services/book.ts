import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../../models/Book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = `${environment.apiBaseUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(page = 0, size = 20): Observable<{ content: Book[]; totalElements: number }> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    console.log('[BookService] getBooks() request ->', this.api, params);
    return this.http.get<{ content: Book[]; totalElements: number }>(this.api, { params });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`);
  }

  getBookById(id: number): Observable<Book> {
    console.debug('[BookService] getBookById() request ->', `/api/books/${id}`);
    return this.http.get<Book>(`/api/books/${id}`);
  }

  addBook(book: Book): Observable<Book> {
    console.debug('[BookService] addBook() request ->', '/api/books', book);
    return this.http.post<Book>('/api/books', book);
  }

  updateBook(id: number, book: Book): Observable<Book> {
    console.debug('[BookService] updateBook() request ->', `/api/books/${id}`, book);
    return this.http.put<Book>(`/api/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    console.debug('[BookService] deleteBook() request ->', `/api/books/${id}`);
    return this.http.delete<void>(`/api/books/${id}`);
  }
}
