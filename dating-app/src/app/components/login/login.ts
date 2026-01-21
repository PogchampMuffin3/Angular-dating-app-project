import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``
})
export class Login {
  email = '';
  password = '';
  loginError = false;

  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onLogin() {
    console.log('Kliknięto Sign In. Dane:', this.email, this.password);
    this.loginError = false;

    if (!this.email || this.email.trim() === '' || !this.password || this.password.trim() === '') {
      console.log('Pola są puste');
      this.loginError = true;
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (isSuccess: boolean) => {
        console.log('Odpowiedź serwera:', isSuccess);
        
        if (isSuccess) {
          this.router.navigate(['/feed']);
        } else {
          this.loginError = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Błąd serwera:', err);
        this.loginError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
