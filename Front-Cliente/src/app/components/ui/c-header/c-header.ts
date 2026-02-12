import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription, interval, map, of, startWith, switchMap } from 'rxjs';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { SolicitudDto } from '../../../models/solicitudes/solicitud.dto';

import { UsuariosService } from '../../../services/usuarios.service';
import { CarritoService } from '../../../services/carrito.service';

@Component({
  selector: 'app-c-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader implements OnInit, OnDestroy {
  numeroPedidos: number = 0;
  unidadesCarrito: number = 0;
  userRol: Rol | null = null;
  solicitudesPendientes: SolicitudDto[] = [];
  mostrarNotificaciones: boolean = false;

  private rolSub: Subscription | null = null;
  private notifSub: Subscription | null = null;
  private cartSub: Subscription | null = null;

  private userId: number | null = null;

  isLoggedIn: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private solicitudesService: SolicitudesService,
    private usuariosService: UsuariosService,
    private carritoService: CarritoService
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.loginService.isLogged();

    this.rolSub = this.loginService.role$.subscribe((rol) => {
      console.log('DEBUG: CHeader received role:', rol);
      this.userRol = rol;
      this.isLoggedIn = this.loginService.isLogged();
      if (this.isLoggedIn) {
        this.startNotificationPolling();
      }
    });

    this.cartSub = this.carritoService.cart$.subscribe(items => {
      this.unidadesCarrito = items.length;
    });

    if (this.isLoggedIn) {
      this.loadUserAndStartPolling();
      // Asegurar que el rol se refresque al iniciar el componente si ya está logueado
      if (!this.userRol) {
        this.loginService.refreshRol();
      }
    }
  }

  loadUserAndStartPolling() {
    const email = localStorage.getItem('email');
    if (!email) return;

    this.usuariosService.getUsuarios().subscribe({
      next: (page) => {
        const found = page.data ? page.data.find(u => u.email === email) : null;
        if (found) {
          this.userId = found.id ?? null;
          this.startNotificationPolling();
        }
      }
    });
  }

  startNotificationPolling() {
    if (this.notifSub) this.notifSub.unsubscribe();

    this.notifSub = interval(30000) // Poll every 30s
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.isLoggedIn && this.userId) {
            // Using the new paginated admin-style request filtered by user
            return this.solicitudesService.getSolicitudesAprobadas();
          }
          return of([]);
        })

      )
      .subscribe({
        next: (notifs) => {
          this.solicitudesPendientes = notifs;
          this.numeroPedidos = notifs.length;
        },
        error: (err) => console.error('Error fetching notifications:', err)
      });
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  irAPerfil() {
    this.mostrarNotificaciones = false;
    this.router.navigate(['/usuarios']);
  }

  get isAdmin(): boolean {
    return this.userRol === Rol.Admin;
  }

  get isPeluqueria(): boolean {
    return this.userRol === Rol.Peluqueria;
  }

  get isUser(): boolean {
    return this.userRol === Rol.Cliente;
  }

  LogOut() {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
    if (this.notifSub) {
      this.notifSub.unsubscribe();
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
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }
}
