import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './Auth.Service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginService } from './login.service';
import { Rol } from '../enums/rol.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(): Observable<boolean> | boolean {
    if (!this.auth.isLogged()) {
      alert('Sesion no iniciada');
      this.router.navigate(['/login']);
      return false;
    }
    this.loginService.getRol().subscribe({
      next: (rol) => {
        if (rol === Rol.Admin) {
          return true;
        } else {
          alert('No tienes permiso para acceder a esta ruta');
          this.router.navigate(['/inicio']);
          return false;
        }
      },
      error: (err) => {
        console.error('Error al obtener el rol:', err);
        return false;
      },
    });
    return true;
  }
}
