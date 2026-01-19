import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LogIn } from '../../../models/login';
import { LoginService } from '../../../services/login.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-c-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './c-login.html',
  styleUrl: './c-login.scss',
})
export class CLogin {
  login: LogIn = { email: '', contrasenya: '' };
  error: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  onSubmitLogin() {
    this.loginService.logIn(this.login).subscribe({
      next: () => {
        this.error = '';
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.error = err.error?.message;
      },
    });
  }
}
