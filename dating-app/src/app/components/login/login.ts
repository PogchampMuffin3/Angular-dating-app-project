import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  loginData = { email:'', password: ''};
  errorMessage = '';

  private authService = inject(Auth);
  private router = inject(Router);

  OnLogin(){
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
