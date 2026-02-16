import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservasService } from '../../../services/reservas.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { LoginService } from '../../../services/login.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-c-mis-reservas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './c-mis-reservas.html',
  styleUrl: './c-mis-reservas.scss',
})
export class CMisReservas implements OnInit, OnDestroy {
  reservas: any[] = [];
  loading: boolean = false;
  soloPendientes: boolean = false;

  userRol: Rol | null = null;
  private rolSub: Subscription | null = null;
  private emailSub: Subscription | null = null;

  private userId: number | null = null;
  private peluqueriaId: number | null = null;

  constructor(
    private reservasService: ReservasService,
    private usuariosService: UsuariosService,
    private loginService: LoginService,
    private peluqueriasService: PeluqueriasService,
  ) {}

  ngOnInit(): void {
    this.rolSub = this.loginService.role$.subscribe((r) => {
      this.userRol = r;
    });

    this.emailSub = this.loginService.email$
      .pipe(
        switchMap((email) => {
          if (!email) {
            this.resetIds();
            return of(null);
          }

          if (this.userRol === Rol.Peluqueria) {
            return this.peluqueriasService.getByEmail(email);
          } else {
            return this.usuariosService.getUsuarios().pipe(
              switchMap((page) => {
                const found = page.data ? page.data.find((u: any) => u.email === email) : null;
                this.userId = found?.id ?? null;
                return of(found);
              }),
            );
          }
        }),
      )
      .subscribe({
        next: (data: any) => {
          if (this.userRol === Rol.Peluqueria && data) {
            this.peluqueriaId = data.id ?? null;
          }
          this.loadReservas();
        },
        error: () => {
          this.resetIds();
        },
      });
  }

  ngOnDestroy(): void {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
      this.rolSub = null;
    }
    if (this.emailSub) {
      this.emailSub.unsubscribe();
      this.emailSub = null;
    }
  }

  get isPeluqueria(): boolean {
    return this.userRol === Rol.Peluqueria;
  }

  onTogglePendientes(checked: any) {
    this.soloPendientes = !!checked;
    this.loadReservas();
  }

  onCancelarReserva(reservaId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      const obs = this.isPeluqueria
        ? this.reservasService.cancelarReservaPeluqueria(reservaId)
        : this.reservasService.cancelarReservaCliente(reservaId);

      obs.subscribe({
        next: () => {
          this.loadReservas();
        },
        error: (err) => {
          console.error('Error al cancelar reserva:', err);
          let msg = 'Error al cancelar la reserva. Intenta de nuevo.';
          try {
            if (err && err.error) {
              if (typeof err.error === 'string') {
                msg = err.error;
              } else if (err.error.message) {
                msg = err.error.message;
              } else {
                msg = JSON.stringify(err.error);
              }
            } else if (err && err.message) {
              msg = err.message;
            }
          } catch (e) {
            console.error('Error parsing backend error message', e);
          }

          alert(msg);
        },
      });
    }
  }

  onConfirmarReserva(reservaId: number) {
    if (confirm('¿Quieres confirmar esta reserva?')) {
      this.reservasService.confirmarReserva(reservaId).subscribe({
        next: () => this.loadReservas(),
        error: (err) => {
          console.error('Error al confirmar reserva:', err);
          alert('No se pudo confirmar la reserva.');
        },
      });
    }
  }

  private resetIds() {
    this.userId = null;
    this.peluqueriaId = null;
    this.reservas = [];
  }

  private loadReservas() {
    if (this.isPeluqueria) {
      this.loadPeluqueriaReservas();
    } else {
      this.loadClienteReservas();
    }
  }

  private loadClienteReservas() {
    if (!this.userId) {
      this.reservas = [];
      return;
    }

    this.loading = true;
    const obs = this.soloPendientes
      ? this.reservasService.listarReservasClienteEstado(this.userId, 'Pendiente')
      : this.reservasService.listarReservasCliente(this.userId);

    obs.subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data)
          ? data
          : data && data.data && Array.isArray(data.data)
            ? data.data
            : [];
        this.reservas = arr;
        this.loading = false;
      },
      error: () => {
        this.reservas = [];
        this.loading = false;
      },
    });
  }

  private loadPeluqueriaReservas() {
    if (!this.peluqueriaId) {
      this.reservas = [];
      return;
    }

    this.loading = true;
    const obs = this.soloPendientes
      ? this.reservasService.listarReservasPeluqueriaEstado(this.peluqueriaId, 'Pendiente')
      : this.reservasService.listarReservasPeluqueria(this.peluqueriaId);

    obs.subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data)
          ? data
          : data && data.data && Array.isArray(data.data)
            ? data.data
            : [];
        this.reservas = arr;
        this.loading = false;
      },
      error: () => {
        this.reservas = [];
        this.loading = false;
      },
    });
  }
}
