import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './Auth.Service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { }

    canActivate(): boolean {
        if (!this.auth.isLogged()) {
            alert('Sesion no iniciada');
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
}
