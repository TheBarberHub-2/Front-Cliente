import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService, CartItem, CarritoResponse } from '../../../services/carrito.service';
import { ReservasService } from '../../../services/reservas.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-c-carrito',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './c-carrito.html',
    styleUrl: './c-carrito.scss'
})
export class CCarrito implements OnInit, OnDestroy {
    items: CartItem[] = [];
    summary: CarritoResponse | null = null;
    selectedDate: string = '';
    minDate: string = '';
    availableSlots: string[] = [];
    selectedSlot: string | null = null;
    userId: number = 0;
    loadingSlots: boolean = false;

    // Datos de pago
    numeroTarjeta: string = '';
    titular: string = '';
    fechaCaducidad: string = '';
    cvc: string = '';
    isProcessing: boolean = false;

    private cartSub: Subscription | null = null;

    constructor(
        private carritoService: CarritoService,
        private reservasService: ReservasService,
        private usuariosService: UsuariosService,
        private router: Router
    ) {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        this.minDate = today.toISOString().split('T')[0];
    }

    ngOnInit() {
        this.cartSub = this.carritoService.cart$.subscribe(items => {
            this.items = items;
            this.updateSummary();
        });

        // Cargar usuario actual de forma sincrónica
        this.usuariosService.getUsuarioActual().subscribe({
            next: u => {
                this.userId = u.id;
                console.log('Usuario cargado:', u.id);
            },
            error: err => {
                console.error('Error al cargar usuario:', err);
                alert('Error al cargar tu información. Por favor, recarga la página.');
            }
        });
    }

    updateSummary() {
        if (this.items.length === 0) {
            this.summary = null;
            this.availableSlots = [];
            return;
        }

        const firstItem = this.items[0];
        if (!firstItem || !firstItem.peluqueriaId) {
            console.error('No hay peluqueriaId en los items del carrito');
            return;
        }

        const peluqueriaId = firstItem.peluqueriaId;
        const productoIds = this.items.map(i => i.id);

        console.log('Calculando carrito para:', { peluqueriaId, productoIds });

        this.carritoService.calcularCarrito({ peluqueriaId, productoIds }).subscribe({
            next: res => {
                console.log('Resumen calculado:', res);
                this.summary = res;
                if (this.selectedDate) {
                    this.fetchSlots();
                }
            },
            error: err => {
                console.error('Error al calcular carrito:', err);
                alert('Error al calcular el resumen: ' + (err.error?.message || 'Error desconocido'));
                this.summary = null;
            }
        });
    }

    onDateChange() {
        this.selectedSlot = null;
        this.fetchSlots();
    }

    fetchSlots() {
        if (!this.selectedDate || !this.summary) {
            console.warn('No se pueden buscar slots: falta fecha o resumen. Resumen:', this.summary);
            return;
        }

        const peluqueriaId = this.items[0]?.peluqueriaId;
        if (!peluqueriaId) return;

        this.loadingSlots = true;
        this.availableSlots = [];

        const request = {
            peluqueriaId: peluqueriaId,
            fecha: this.selectedDate,
            duracionTotal: this.summary.duracionTotal
        };

        console.log('Buscando slots con:', request);

        this.carritoService.obtenerSlotsDisponibles(request).subscribe({
            next: res => {
                console.log('Slots recibidos:', res);
                this.availableSlots = res.horasDisponibles;
                this.loadingSlots = false;
            },
            error: err => {
                console.error('Error al obtener slots:', err);
                this.loadingSlots = false;
                alert('No se pudieron cargar los horarios: ' + (err.error?.message || 'Error desconocido'));
            }
        });
    }

    removeItem(id: number) {
        this.carritoService.removeFromCart(id);
    }

    get peluqueriaNombre(): string {
        return this.items.length > 0 ? this.items[0].peluqueriaNombre : '';
    }

    confirmarReserva() {
        if (!this.selectedDate || !this.selectedSlot || this.items.length === 0) return;
        if (!this.numeroTarjeta || !this.titular || !this.fechaCaducidad || !this.cvc) {
            alert('Por favor, completa los datos de pago.');
            return;
        }
        if (this.userId === 0) {
            alert('Error: No se pudo obtener tu ID de usuario. Por favor, recarga la página.');
            return;
        }

        this.isProcessing = true;

        // Convertir selectedSlot a LocalTime format (HH:mm)
        let horaInicio = this.selectedSlot || '00:00';
        if (horaInicio.includes(':')) {
            // Si ya tiene formato HH:mm, usarlo tal cual
        } else {
            // Si es solo número, convertir
            const minutes = parseInt(horaInicio, 10);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            horaInicio = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }

        // Calcular día de semana (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const fecha = new Date(this.selectedDate);
        const diaSemana = fecha.getDay();

        // Crear Reserva con datos de pago incluidos
        this.reservasService.crearReserva({
            reserva: {
                clienteId: this.userId,
                peluqueriaId: this.items[0].peluqueriaId,
                diaSemana: diaSemana,
                productoIds: this.items.map(i => i.id),
                fechaReserva: this.selectedDate,
                horaInicio: horaInicio
            },
            origen: {
                numeroTarjeta: this.numeroTarjeta,
                nombreCompleto: this.titular,
                fechaCaducidad: this.fechaCaducidad,
                cvc: this.cvc,
            }
        }).subscribe({
            next: () => {
                alert('¡Pago realizado y reserva confirmada con éxito!');
                this.carritoService.clearCart();
                this.router.navigate(['/usuarios']);
                this.isProcessing = false;
            },
            error: err => {
                console.error('Error en la reserva:', err);
                alert('Error al procesar la reserva: ' + (err.error?.message || 'Datos de tarjeta inválidos o saldo insuficiente'));
                this.isProcessing = false;
            }
        });
    }

    ngOnDestroy() {
        if (this.cartSub) this.cartSub.unsubscribe();
    }
}
