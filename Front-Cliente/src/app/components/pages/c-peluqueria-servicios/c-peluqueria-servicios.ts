import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { ProductoSummary } from '../../../models/productos/producto.summary';

@Component({
    selector: 'app-c-peluqueria-servicios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './c-peluqueria-servicios.html',
    styleUrl: './c-peluqueria-servicios.scss'
})
export class CPeluqueriaServicios {
    solicitud = {
        tipo: 'modificar',
        servicioActual: '',
        nuevoNombre: '',
        nuevaDescripcion: '',
        nuevoPrecio: 0,
        motivo: ''
    };

    enviado: boolean = false;
    servicios: ProductoSummary[] = [];
    loading: boolean = true;

    constructor(private productosService: ProductosService) { }

    ngOnInit(): void {
        this.loadServicios();
    }

    loadServicios(): void {
        this.loading = true;
        this.productosService.getProductos().subscribe({
            next: (page) => {
                this.servicios = page.data || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar servicios:', err);
                this.loading = false;
            }
        });
    }

    seleccionarServicio(servicio: ProductoSummary) {
        this.solicitud.tipo = 'modificar';
        this.solicitud.servicioActual = servicio.nombre;
        this.solicitud.nuevoNombre = servicio.nombre;
        this.solicitud.nuevoPrecio = servicio.precio;
        // Hacer scroll al formulario
        document.querySelector('.c-servicios-solicitud__card')?.scrollIntoView({ behavior: 'smooth' });
    }

    onSubmit() {
        console.log('Solicitud enviada:', this.solicitud);
        // Simulación de envío
        this.enviado = true;
        setTimeout(() => {
            this.enviado = false;
            this.resetForm();
        }, 3000);
    }

    resetForm() {
        this.solicitud = {
            tipo: 'modificar',
            servicioActual: '',
            nuevoNombre: '',
            nuevaDescripcion: '',
            nuevoPrecio: 0,
            motivo: ''
        };
    }
}
