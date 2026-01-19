import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-c-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader {
  numeroPedidos: number = 0;

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
