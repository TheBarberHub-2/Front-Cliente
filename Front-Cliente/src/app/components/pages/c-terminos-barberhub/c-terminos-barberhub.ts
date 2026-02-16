import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudesService } from '../../../services/solicitudes.service';

@Component({
  selector: 'app-c-terminos-barberhub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './c-terminos-barberhub.html',
  styleUrl: './c-terminos-barberhub.scss',
})
export class CTerminosBarberhub implements OnInit {
  acceptedTerms: boolean = false;
  loading: boolean = false;
  error: string = '';
  showPaymentForm: boolean = false;

  numeroTarjeta: string = '';
  titular: string = '';
  fechaCaducidad: string = '';
  cvc: string = '';

  constructor(
    private router: Router,
    private solicitudesService: SolicitudesService,
  ) {}

  ngOnInit(): void {
    const hasApproval = localStorage.getItem('hasApproval');
    if (!hasApproval) {
      this.router.navigate(['/usuarios']);
    }
  }

  proceedToPayment(): void {
    if (!this.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    this.showPaymentForm = true;
  }

  confirmarPago(): void {
    if (!this.numeroTarjeta || !this.titular || !this.fechaCaducidad || !this.cvc) {
      this.error = 'Por favor completa todos los campos del formulario de pago.';
      return;
    }

    const stored = localStorage.getItem('hasApproval');
    if (!stored) {
      this.error = 'No se encontró la solicitud a confirmar.';
      return;
    }

    const solicitudId = parseInt(stored, 10);
    if (isNaN(solicitudId)) {
      this.error = 'ID de solicitud inválido.';
      return;
    }

    this.error = '';
    this.loading = true;

    const pago = {
      numeroTarjeta: this.numeroTarjeta,
      fechaCaducidad: this.fechaCaducidad,
      cvc: this.cvc,
      nombreCompleto: this.titular,
    };

    this.solicitudesService.confirmarSolicitud(solicitudId, pago).subscribe({
      next: () => {
        this.loading = false;
        this.showPaymentForm = false;
        localStorage.removeItem('hasApproval');
        alert('Pago procesado y solicitud confirmada. ¡Bienvenido a BarberHub!');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al procesar el pago.';
      },
    });
  }

  get isSubmitDisabled(): boolean {
    return !this.acceptedTerms || this.loading;
  }

  formatearTarjeta() {
    let limpio = this.numeroTarjeta.replace(/\D/g, '');

    let formateado = limpio.match(/.{1,4}/g)?.join(' ') || '';

    this.numeroTarjeta = formateado;
  }

  formatearFecha() {
    let limpio = this.fechaCaducidad.replace(/\D/g, '');

    if (limpio.length > 4) {
      this.fechaCaducidad = limpio.slice(0, 4) + '-' + limpio.slice(4, 6);
    } else {
      this.fechaCaducidad = limpio;
    }
  }
}
