import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-c-cerrar-sesion',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './c-cerrar-sesion.html',
  styleUrl: './c-cerrar-sesion.scss',
})
export class CCerrarSesion {
  constructor(private loginService: LoginService, private router: Router) {}

  logout(): void {
    this.loginService.logOut().subscribe((x) => {
      this.router.navigate(['']);
    });
  }
}
