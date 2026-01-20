import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post';
import { Auth } from '../../services/auth'

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html'
})
export class Feed implements OnInit {
  posts: any[] = [];
  newPostContent = '';
  myId: number = 0;

  private postService = inject(PostService);
  private cdr = inject(ChangeDetectorRef);

  public authService = inject(Auth);

  ngOnInit() {
    // 1. Sprawdzamy kim jesteśmy
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.myId = user.id;
    }
    // 2. Ładujemy posty
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe(data => {
      this.posts = data.slice().reverse();
      this.cdr.detectChanges();
    });
  }

  addPost() {
    if (this.newPostContent.trim()) {
      this.postService.addPost(this.newPostContent).subscribe(() => {
        this.newPostContent = '';
        this.loadPosts();
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
      error: (err) => console.error("Błąd lajkowania:", err)
    });
  }
}
