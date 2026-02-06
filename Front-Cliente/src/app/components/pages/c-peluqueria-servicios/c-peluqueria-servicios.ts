import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { ProductoSummary } from '../../../models/productos/producto.summary';
import { LoginService } from '../../../services/login.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { CategoriasService } from '../../../services/categorias.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { Categoria } from '../../../models/categorias/categoria';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-c-peluqueria-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './c-peluqueria-servicios.html',
  styleUrl: './c-peluqueria-servicios.scss',
})
export class CPeluqueriaServicios implements OnInit {
  solicitud = {
    nuevoNombre: '',
    nuevaDescripcion: '',
    nuevoPrecio: 0,
    duracion: 30,
    categoriaId: 0,
    motivo: '',
  };

  categorias: Categoria[] = [];

  enviado: boolean = false;
  servicios: ProductoSummary[] = [];
  loading: boolean = true;

  peluqueriaNombre: string = '';

  constructor(
    private productosService: ProductosService,
    private loginService: LoginService,
    private peluqueriasService: PeluqueriasService,
    private categoriasService: CategoriasService,
    private solicitudesService: SolicitudesService
  ) { }

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
          this.loadCategorias();
        }
      });
  }

  loadCategorias(): void {
    this.categoriasService.getCategorias().subscribe({
      next: (page) => {
        this.categorias = page.data || [];
        if (this.categorias.length > 0) {
          this.solicitud.categoriaId = this.categorias[0].id;
        }
      },
      error: (err) => console.error('Error al cargar categorías:', err)
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

  onSubmit() {
    const request = {
      nombre: this.solicitud.nuevoNombre,
      precio: this.solicitud.nuevoPrecio,
      duracion: this.solicitud.duracion,
      categoriaId: Number(this.solicitud.categoriaId)
    };

    this.solicitudesService.crearSolicitudProducto(request).subscribe({
      next: () => {
        this.enviado = true;
        setTimeout(() => {
          this.enviado = false;
          this.resetForm();
        }, 3000);
      },
      error: (err) => {
        console.error('Error al enviar solicitud:', err);
        alert('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
      }
    });
  }

  resetForm() {
    this.solicitud = {
      nuevoNombre: '',
      nuevaDescripcion: '',
      nuevoPrecio: 0,
      duracion: 30,
      categoriaId: this.categorias.length > 0 ? this.categorias[0].id : 0,
      motivo: '',
    };
  }
}
