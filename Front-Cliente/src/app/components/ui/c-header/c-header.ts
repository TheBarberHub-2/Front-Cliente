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
  private emailSub: Subscription | null = null;

  private userId: number | null = null;

  isLoggedIn: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private solicitudesService: SolicitudesService,
    private usuariosService: UsuariosService,
    private carritoService: CarritoService,
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.loginService.isLogged();

    this.rolSub = this.loginService.role$.subscribe((rol) => {
      this.userRol = rol;
      this.isLoggedIn = this.loginService.isLogged();
      if (this.isLoggedIn) {
        this.startNotificationPolling();
      }
    });

    this.cartSub = this.carritoService.cart$.subscribe((items) => {
      this.unidadesCarrito = items.length;
    });

    // React to login email changes so we can update userId and polling immediately
    this.emailSub = this.loginService.email$.subscribe((email) => {
      if (email) {
        // update userId and restart polling for the new user
        this.usuariosService.getUsuarios().subscribe({
          next: (page) => {
            const found = page.data ? page.data.find((u) => u.email === email) : null;
            this.userId = found?.id ?? null;
            // restart polling when userId changes
            this.startNotificationPolling();
          },
          error: () => {
            this.userId = null;
            this.stopPolling();
          },
        });
      } else {
        // logged out
        this.userId = null;
        this.solicitudesPendientes = [];
        this.numeroPedidos = 0;
        this.stopPolling();
      }
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
        const found = page.data ? page.data.find((u) => u.email === email) : null;
        if (found) {
          this.userId = found.id ?? null;
          this.startNotificationPolling();
        }
      },
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
        }),
      )
      .subscribe({
        next: (notifs) => {
          // Normalize response to an array and filter by the logged-in user's id
          const arr: SolicitudDto[] = Array.isArray(notifs)
            ? notifs
            : notifs && (notifs as any).data && Array.isArray((notifs as any).data)
              ? (notifs as any).data
              : [];

          const filtered = arr.filter((n) => {
            const notifUserId = (n as any).usuarioId ?? (n as any).usuario?.id ?? null;
            return this.userId != null && notifUserId === this.userId;
          });

          this.solicitudesPendientes = filtered;
          // Badge must reflect the number of approved requests for this user
          this.numeroPedidos = filtered.length;
        },
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
    // Stop polling and clear notification state immediately
    this.stopPolling();
    // Clear the carrito service so items are not persisted between users/sessions
    this.carritoService.clearCart();
    // Keep subscriptions for role/email so they can emit updated values to the component.
    this.userRol = null;
    this.isLoggedIn = false;
    this.solicitudesPendientes = [];
    this.numeroPedidos = 0;
    this.unidadesCarrito = 0;

    this.loginService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  private stopPolling() {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
      this.notifSub = null;
    }
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
    if (this.emailSub) {
      this.emailSub.unsubscribe();
    }
  }
}
