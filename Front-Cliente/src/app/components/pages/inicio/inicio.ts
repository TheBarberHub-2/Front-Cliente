import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription } from 'rxjs';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario } from '../../../models/usuarios/usuario';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  searchTerm: string = '';
  allBarberias: PeluqueriaSummary[] = [];
  filteredBarberias: PeluqueriaSummary[] = [];

  categorias = [
    { name: 'Corte de Pelo', icon: '✂️' },
    { name: 'Barba', icon: '🧔' },
    { name: 'Tinte', icon: '🎨' },
    { name: 'Tratamientos', icon: '💆' },
  ];

  userRol: Rol | null = null;
  usuario: Usuario | null = null;
  private rolSub: Subscription | null = null;

  constructor(
    private peluqueriasService: PeluqueriasService,
    private loginService: LoginService,
    private usuariosService: UsuariosService,
  ) {}

  ngOnInit(): void {
    this.rolSub = this.loginService.role$.subscribe((rol) => {
      this.userRol = rol;
      if (rol) {
        this.loadUserData();
      }
    });
    this.loadBarberias();
  }

  loadUserData(): void {
    const loggedEmail = localStorage.getItem('email');
    if (loggedEmail) {
      this.usuariosService.getUsuarios().subscribe({
        next: (page) => {
          this.usuario = page.data.find((u) => u.email === loggedEmail) || null;
        },
      });
    }
  }

  get isPeluqueria(): boolean {
    return this.userRol === Rol.Peluqueria;
  }

  get isAdmin(): boolean {
    return this.userRol === Rol.Admin;
  }

  loadBarberias(): void {
    this.peluqueriasService.getPeluquerias().subscribe({
      next: (page) => {
        this.allBarberias = page.data || [];
        this.filteredBarberias = [...this.allBarberias];
      },
      error: (err) => console.error('Error cargando barberías', err),
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBarberias = [...this.allBarberias];
      return;
    }

    this.filteredBarberias = this.allBarberias.filter(
      (b) =>
        b.nombre.toLowerCase().includes(term) ||
        b.direccion.toLowerCase().includes(term) ||
        b.municipio.toLowerCase().includes(term),
    );
  }

  getRandomImage(id: any): string {
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop';
  }

  ngOnDestroy(): void {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
  }
}
