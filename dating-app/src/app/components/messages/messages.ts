import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Message } from '../../services/message';
import { Auth } from '../../services/auth';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './messages.html',
  styles: ``
})
export class Messages implements OnInit {
  users: any[] = [];
  messages: any[] = [];
  selectedUser: any = null;
  newMessageText = '';
  myId: number = 0;

  private messageService = inject(Message);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      this.myId = currentUser.id;
    }

    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.users = data.filter(u => u.id !== this.myId);
        this.loadLastMessages();
        if (this.users.length > 0 && !this.selectedUser) {
          this.selectUser(this.users[0]);
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania użytkowników:', err)
    });
  }

  loadLastMessages() {
    const requests = this.users.map(user =>
      this.messageService.getChat(user.id).pipe(
        map(chat => {
          const last = chat && chat.length > 0 ? chat[chat.length - 1] : null;
          return {
            userId: user.id,
            lastMsg: last ? last.content : '',
            lastTime: last ? last.time : ''
          };
        })
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach(res => {
        const user = this.users.find(u => u.id === res.userId);
        if (user) {
          user.lastMsg = res.lastMsg;
          user.lastTime = res.lastTime;
        }
      });

      this.cdr.detectChanges();
    });
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.messages = [];
    this.cdr.detectChanges();
    this.loadChat();
  }

  loadChat() {
    if (!this.selectedUser) return;

    this.messageService.getChat(this.selectedUser.id).subscribe({
      next: (data) => {
        this.messages = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania czatu:', err)
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedUser) return;

    this.messageService.sendMessage(this.selectedUser.id, this.newMessageText)
      .subscribe({
        next: (newMsg) => {
          this.messages.push(newMsg);
          this.newMessageText = '';
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Błąd wysyłania:', err)
      });
  }

  backToList() {
    this.selectedUser = null;
  }
}
