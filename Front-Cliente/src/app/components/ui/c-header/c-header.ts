import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-c-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader {
  numeroPedidos: number = 0;

  constructor(private loginService: LoginService) { }

  get isLoggedIn(): boolean {
    return this.loginService.isLogged();
  }
  LogOut(){
   return this.loginService.logout();
  }
}
