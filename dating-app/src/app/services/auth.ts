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
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(users => {
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
          this.currentUserSubject.next(user);
          localStorage.setItem('user', JSON.stringify(user));
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
