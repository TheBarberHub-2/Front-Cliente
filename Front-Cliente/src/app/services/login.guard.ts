import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(private loginService: LoginService, private router: Router) { }

    canActivate(): boolean {
        if (!this.loginService.isLogged()) {
            alert('Sesion no iniciada');
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
}
