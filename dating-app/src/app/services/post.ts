import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/posts';
  private authService = inject(Auth);

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  addPost(content: string): Observable<any> {
    const currentUser = this.authService.getCurrentUserValue();
    const authorName = currentUser ? currentUser.name : 'Gosc';
    const authorAvater = currentUser ? currentUser.avatarColor : 'bg-secondary';

    const newPost = {
      id: Date.now(),
      author: authorName,
      avatarColor: authorAvater,
      createdAt: Date.now(),
      content: content,
      likes: 0,
      likedBy: []
    };

    return this.http.post(this.apiUrl, newPost, this.getHeaders());
  }

  toggleLike(postId: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, {}, this.getHeaders());
  }
}
