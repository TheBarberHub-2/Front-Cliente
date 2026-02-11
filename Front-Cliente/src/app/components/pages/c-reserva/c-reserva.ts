import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { ProductosService } from '../../../services/productos.service';
import { LoginService } from '../../../services/login.service';
import { CarritoService } from '../../../services/carrito.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription } from 'rxjs';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';
import { ProductoSummary } from '../../../models/productos/producto.summary';
import { PeluqueriaHorario } from '../../../models/peluquerias/peluqueria-horario';

@Component({
  selector: 'app-c-reserva',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './c-reserva.html',
  styleUrl: './c-reserva.scss',
})
export class CReserva implements OnInit, OnDestroy {
  peluqueria: PeluqueriaSummary | null = null;
  servicios: ProductoSummary[] = [];
  horarios: PeluqueriaHorario[] = [];
  loading: boolean = true;
  peluqueriaId: number = 0;
  isPeluqueria: boolean = false;

  // Nuevas variables para reserva reactiva
  selectedServices: number[] = [];
  minDate: string = '';

  private rolSub: Subscription | null = null;
  private userId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peluqueriasService: PeluqueriasService,
    private productosService: ProductosService,
    private loginService: LoginService,
    private carritoService: CarritoService,
    private usuariosService: UsuariosService
  ) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // No permitir el mismo día
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.rolSub = this.loginService.role$.subscribe((rol) => {
      this.isPeluqueria = rol === Rol.Peluqueria;
    });

    this.usuariosService.getUsuarioActual().subscribe(u => {
      this.userId = u.id;
    });

    this.carritoService.cart$.subscribe(items => {
      this.selectedServices = items.map(i => i.id);
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.peluqueriaId = +idParam;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;

    this.peluqueriasService.verPeluqueria(this.peluqueriaId).subscribe({
      next: (data) => {
        this.peluqueria = data;

        this.peluqueriasService.getHorarios(this.peluqueriaId).subscribe({
          next: (horarios) => {
            this.horarios = this.formatHorarios(horarios);
          },
          error: (err) => console.error('Error cargando horarios', err)
        });

        this.productosService.getProductos().subscribe({
          next: (page) => {
            const all = page.data || [];
            this.servicios = all.filter((p) => p.peluqueria === this.peluqueria?.nombre);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar servicios', err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error al cargar peluquería', err);
        this.loading = false;
      },
    });
  }

  toggleService(servicio: ProductoSummary): void {
    if (!servicio.id) return;

    const item = {
      id: servicio.id,
      nombre: servicio.nombre,
      precio: Number(servicio.precio),
      duracion: servicio.duracion || 30,
      peluqueriaId: this.peluqueriaId,
      peluqueriaNombre: this.peluqueria?.nombre || ''
    };

    this.carritoService.addToCart(item);
  }

  isSelectionEmpty(): boolean {
    return this.selectedServices.length === 0;
  }

  isInCart(id: number | undefined): boolean {
    if (!id) return false;
    return this.selectedServices.includes(id);
  }

  formatHorarios(horarios: any[]): any[] {
    return horarios.map(h => ({
      ...h,
      horaApertura: h.horaApertura ? String(h.horaApertura).substring(0, 5) : '00:00',
      horaCierre: h.horaCierre ? String(h.horaCierre).substring(0, 5) : '00:00'
    }));
  }

  getRandomImage(id: any): string {
    const images = [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621605815841-db897c4733dd?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512690199101-8316d2673838?q=80&w=2070&auto=format&fit=crop',
    ];
    return images[id % images.length];
  }

  ngOnDestroy(): void {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
  }
}
