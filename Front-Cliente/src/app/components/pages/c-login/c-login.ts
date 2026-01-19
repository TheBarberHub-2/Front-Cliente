import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LogIn } from '../../../models/login';
import { LoginService } from '../../../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-c-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './c-login.html',
  styleUrl: './c-login.scss',
})
export class CLogin implements OnInit {
  loginForm!: FormGroup;
  login: LogIn = { email: '', contrasenya: '' };
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contraseña: ['', Validators.required],
    });
  }

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
