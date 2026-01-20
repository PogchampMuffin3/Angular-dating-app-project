import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './profile.html',
  styles: ``
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(Auth, { optional: true });
  private cdr = inject(ChangeDetectorRef);

  user: any = null;
  userPosts: any[] = [];

  private API_URL = 'http://localhost:3000'; 

  extraInfo = {
    bio: 'Student Informatyki | Angular Enthusiast 🚀',
    work: 'Angular Devs',
    location: 'Warszawa',
    friendsCount: 345
  };

  ngOnInit() {
    let targetUserId: any = 1;

    if (this.authService) {
      const loggedUser = this.authService.getCurrentUserValue();
      if (loggedUser && loggedUser.id) {
        targetUserId = loggedUser.id;
      }
    }

    this.loadUserProfile(targetUserId);
  }

  loadUserProfile(userId: any) {
    this.http.get<any>(`${this.API_URL}/users/${userId}`).subscribe({
      next: (u) => {
        this.user = { ...u, ...this.extraInfo };
        
        const authorName = u.name || u.email || 'Nieznany';
        this.loadPosts(authorName);
        
        this.cdr.detectChanges();
      }
    });
  }

  loadPosts(authorName: string) {
    this.http.get<any[]>(`${this.API_URL}/posts`).pipe(
      map(posts => posts.filter(p => p.author === authorName))
    ).subscribe({
      next: (posts) => {
        this.userPosts = posts;
        this.cdr.detectChanges();
      }
    });
  }
}
