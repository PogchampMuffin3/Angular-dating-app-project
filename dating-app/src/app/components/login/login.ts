import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  loginData = { email:'', password: ''};
  errorMessage = '';

  private authService = inject(Auth);
  private router = inject(Router);

  onLogin(){
    console.log("Próba logowania danymi:", this.loginData);

    this.authService.login(this.loginData.email, this.loginData.password).subscribe(() => {
      const user = this.authService.getCurrentUserValue();
      if(user){
        this.router.navigate(['/feed']);
      }
      else{
        this.errorMessage = 'Bledne dane logowania';
      }
    });
  }
}
