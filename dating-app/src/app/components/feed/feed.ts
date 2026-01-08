import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html'
})
export class Feed implements OnInit {
  posts: any[] = [];
  newPostContent = '';

  private postService = inject(PostService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
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
}
