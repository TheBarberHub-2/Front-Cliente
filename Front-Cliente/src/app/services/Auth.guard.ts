import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginService } from './login.service';
import { Rol } from '../enums/rol.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) { }

  canActivate(): Observable<boolean> | boolean {
    if (!this.loginService.isLogged()) {
      alert('Sesión no iniciada');
      this.router.navigate(['/login']);
      return false;
    }

    return this.loginService.getRol().pipe(
      map((rol) => {
        if (rol === Rol.Admin) {
          return true;
        } else {
          alert('No tienes permiso para acceder a esta ruta');
          this.router.navigate(['/inicio']);
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error al obtener el rol:', err);
        this.router.navigate(['/inicio']);
        return of(false);
      })
    );
  }
}
