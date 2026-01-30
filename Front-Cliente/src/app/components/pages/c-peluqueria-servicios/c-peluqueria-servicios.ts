import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { ProductoSummary } from '../../../models/productos/producto.summary';
import { LoginService } from '../../../services/login.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-c-peluqueria-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './c-peluqueria-servicios.html',
  styleUrl: './c-peluqueria-servicios.scss',
})
export class CPeluqueriaServicios {
  solicitud = {
    tipo: 'modificar',
    servicioActual: '',
    nuevoNombre: '',
    nuevaDescripcion: '',
    nuevoPrecio: 0,
    motivo: '',
  };

  enviado: boolean = false;
  servicios: ProductoSummary[] = [];
  loading: boolean = true;

  peluqueriaNombre: string = '';

  constructor(
    private productosService: ProductosService,
    private loginService: LoginService,
    private peluqueriasService: PeluqueriasService,
  ) {}

  ngOnInit(): void {
    // 1. Obtener email del usuario logueado
    this.loginService.email$
      .pipe(
        switchMap((email) => {
          if (!email) return of(null);
          // 2. Obtener peluquería asociada al email
          return this.peluqueriasService.getByEmail(email);
        }),
      )
      .subscribe((pelu) => {
        if (pelu) {
          this.peluqueriaNombre = pelu.nombre;
          this.loadServicios();
        }
      });
  }

  loadServicios(): void {
    this.loading = true;

    this.productosService.getProductos().subscribe({
      next: (page) => {
        const all = page.data || [];

        // 3. Filtrar solo los servicios de esta peluquería
        this.servicios = all.filter((s) => s.peluqueria === this.peluqueriaNombre);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.loading = false;
      },
    });
  }

  seleccionarServicio(servicio: ProductoSummary) {
    this.solicitud.tipo = 'modificar';
    this.solicitud.servicioActual = servicio.nombre;
    this.solicitud.nuevoNombre = servicio.nombre;
    this.solicitud.nuevoPrecio = servicio.precio;

    document.querySelector('.c-servicios-solicitud__card')?.scrollIntoView({ behavior: 'smooth' });
  }

  onSubmit() {
    console.log('Solicitud enviada:', this.solicitud);
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
      motivo: '',
    };
  }
}
