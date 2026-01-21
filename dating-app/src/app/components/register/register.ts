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

  registerError = false;

  private authService = inject(Auth);
  private router = inject(Router);

  onRegister() {
    this.registerError = false;

    if (!this.registerData.firstName || !this.registerData.lastName || 
        !this.registerData.email || !this.registerData.password) {
      this.registerError = true;
      return;
    }

    const fullName = `${this.registerData.firstName} ${this.registerData.lastName}`;

    this.authService.register(fullName, this.registerData.email, this.registerData.password)
      .subscribe({
        next: () => {
          console.log('Zarejestrowano pomyślnie!');
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          console.error(err);
          this.registerError = true;
        }
      });
  }
}
