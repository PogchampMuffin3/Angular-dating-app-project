import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Message {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, this.getHeaders());
  }

  getChat(friendId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/${friendId}`, this.getHeaders());
  }

  sendMessage(toId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages`, { toId, content }, this.getHeaders());
  }
}
