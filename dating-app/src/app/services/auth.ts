import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, pass: string){
    return this.http.post<any>('http://localhost:3000/login', {email, password: pass}).pipe(
      tap(response => {
        if (response.token) {
          console.log("Token JWT:", response.token); // Pokaż to prowadzącemu!

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          }
      })
    );
  }

  autoLogin(){
    const savedUser = localStorage.getItem('user');
    if(savedUser){
      this.currentUserSubject.next(JSON.parse((savedUser)));
    }
  }

  logout(){
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
  }

  getCurrentUserValue(){
    return this.currentUserSubject.value;
  }
}
