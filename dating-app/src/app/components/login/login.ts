import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``
})
export class Login {
  // ZMIANA: Dodanie brakujących właściwości
  email = '';
  password = '';

  private authService = inject(Auth);
  private router = inject(Router);

  // ZMIANA: Zmiana nazwy metody na onLogin (albo możesz zostawić login, ale wtedy zmień w HTML)
  onLogin() {
    if (this.authService.login(this.email, this.password)) {
      this.router.navigate(['/feed']);
    } else {
      alert('Invalid credentials');
    }
  }
}
