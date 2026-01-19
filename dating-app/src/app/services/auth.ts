import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';
  private router = inject(Router);

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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  register(name: string, email: string, pass: string) {
    return this.http.post<any>('http://localhost:3000/register', { name: name, email: email, password: pass }).pipe(
      tap(response => {
        if (response.token) {
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

  getCurrentUserValue(){
    return this.currentUserSubject.value;
  }
}
