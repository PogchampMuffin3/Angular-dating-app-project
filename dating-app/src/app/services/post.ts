import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/posts';

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  private authService = inject(Auth);

  addPost(content: string): Observable<any> {
    const currentUser = this.authService.getCurrentUserValue();
    const authorName = currentUser ? currentUser.name : 'Gosc';
    const authorAvater = currentUser ? currentUser.avatarColor : 'bg-secondary';

    const newPost = {
      author: authorName,
      avatarColor: authorAvater,
      time: 'Przed chwilą',
      content: content,
      likes: 0
    };
    return this.http.post(this.apiUrl, newPost);
  }
}
