import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html'
})
export class Register {
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };
  errorMessage = '';

  private authService = inject(Auth);
  private router = inject(Router);

  onRegister() {
    // Prosta walidacja: czy wszystko wypełnione?
    if (!this.registerData.firstName || !this.registerData.lastName || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Wypełnij wszystkie pola!';
      return;
    }

    // Łączymy imię i nazwisko w jedną nazwę (dla uproszczenia bazy)
    const fullName = `${this.registerData.firstName} ${this.registerData.lastName}`;

    // Wywołujemy rejestrację w serwisie
    this.authService.register(fullName, this.registerData.email, this.registerData.password)
      .subscribe({
        next: () => {
          console.log('Zarejestrowano pomyślnie!');
          this.router.navigate(['/feed']); // Przekieruj do aplikacji
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Błąd rejestracji (może taki email już istnieje?)';
        }
      });
  }
}
