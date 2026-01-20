import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styles: ``
})
export class Profile implements OnInit {
  posts: any[] = [];
  newPostContent = '';
  myId: number = 0;

  private postService = inject(PostService);
  public authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.myId = user.id;
      this.loadMyPosts();
    }
  }

  loadMyPosts() {
    this.postService.getPosts().subscribe(data => {
      // Filtrujemy posty tylko dla zalogowanego użytkownika (lub np. wg ID z URL, jeśli robisz podgląd innych)
      // Tutaj zakładam profil "Mój", więc filtruję po this.myId (o ile post ma pole authorId, lub po nazwie autora)
      
      // Proste filtrowanie po autorze (dopasuj do swojego API/modelu danych)
      const currentUser = this.authService.getCurrentUserValue();
      if(currentUser) {
         // Zakładam, że w postach jest pole 'author' z nazwą lub 'authorId'
         // Jeśli nie masz ID autora w poście, filtruj po nazwie:
         this.posts = data.filter(p => p.author === currentUser.name).slice().reverse();
      } else {
         this.posts = [];
      }
      
      this.cdr.detectChanges();
    });
  }

  addPost() {
    if (this.newPostContent.trim()) {
      this.postService.addPost(this.newPostContent).subscribe(() => {
        this.newPostContent = '';
        this.loadMyPosts();
      });
    }
  }

  isLikedByMe(post: any): boolean {
    if (!post.likedBy) return false;
    return post.likedBy.includes(this.myId);
  }

  likePost(post: any) {
    this.postService.toggleLike(post.id).subscribe({
      next: (updatedPost) => {
        post.likes = updatedPost.likes;
        post.likedBy = updatedPost.likedBy;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error liking post:", err)
    });
  }
}
