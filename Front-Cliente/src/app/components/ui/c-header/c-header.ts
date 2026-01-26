import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-c-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader {
  numeroPedidos: number = 0;
  userRol: Rol | null = null;
  private rolSub: Subscription | null = null;

  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit() {
    this.rolSub = this.loginService.role$.subscribe((rol) => {
      console.log('DEBUG: CHeader userRol updated to:', rol);
      this.userRol = rol;
    });
  }

  get isLoggedIn(): boolean {
    return this.loginService.isLogged();
  }

  get isAdmin(): boolean {
    return this.userRol === Rol.Admin;
  }

  get isPeluqueria(): boolean {
    return this.userRol === Rol.Peluqueria;
  }

  get isUser(): boolean {
    return this.userRol === Rol.User;
  }

  LogOut() {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
    this.userRol = null;
    this.loginService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy() {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
  }
}
