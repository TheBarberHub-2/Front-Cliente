import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';
import { LoginService } from '../../../services/login.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription } from 'rxjs';
import { CarritoService } from '../../../services/carrito.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-c-catalogo-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './c-catalogo-servicios.html',
  styleUrl: './c-catalogo-servicios.scss',
})
export class CCatalogoServicios implements OnInit, OnDestroy {
  categoria: string = '';
  searchTerm: string = '';
  allServicios: any[] = [];
  filteredServicios: any[] = [];
  paginatedServicios: any[] = [];
  allBarberias: PeluqueriaSummary[] = [];
  loading: boolean = true;

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  isPeluqueria: boolean = false;
  private rolSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private peluqueriasService: PeluqueriasService,
    private loginService: LoginService,
    private carritoService: CarritoService,
  ) {}

  isInCart(id: number): boolean {
    let inCart = false;
    this.carritoService.cart$
      .subscribe((items) => {
        inCart = items.some((i) => i.id === id);
      })
      .unsubscribe();
    return inCart;
  }

  toggleService(servicio: any): void {
    if (!servicio.id) return;

    const item = {
      id: servicio.id,
      nombre: servicio.nombre,
      precio: Number(servicio.precio),
      duracion: servicio.duracion || 30,
      peluqueriaId: servicio.barberia.id,
      peluqueriaNombre: servicio.barberia.nombre,
    };

    this.carritoService.addToCart(item);
  }

  ngOnInit(): void {
    this.rolSub = this.loginService.role$.subscribe((rol) => {
      this.isPeluqueria = rol === Rol.Peluqueria;
    });
    this.route.params.subscribe((params) => {
      this.categoria = params['categoria'];
      this.loadInitialData();
    });
  }

  loadInitialData(): void {
    this.loading = true;
    this.peluqueriasService.getPeluquerias().subscribe({
      next: (page) => {
        this.allBarberias = page.data || [];
        this.loadServicios();
      },
      error: (err) => {
        console.error('Error cargando peluquerías', err);
        this.loadServicios();
      },
    });
  }

  loadServicios(): void {
    this.productosService.getProductos().subscribe({
      next: (page) => {
        this.allServicios = (page.data || []).map((s: any) => {
          const index = (s.id || 0) % (this.allBarberias.length || 1);
          const barberiaReal =
            this.allBarberias.length > 0
              ? this.allBarberias[index]
              : { nombre: 'The Barber Hub', id: 1 };

          return {
            ...s,
            barberia: s.barberia || barberiaReal,
          };
        });
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error cargando servicios', err);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const categoria = this.normalizarCategoria(this.categoria).toLowerCase();

    this.filteredServicios = this.allServicios.filter((s: any) => {
      const matchesCategoria = categoria === 'explorar' || s.categoria?.toLowerCase() === categoria;
      const matchesSearch =
        !term ||
        s.nombre.toLowerCase().includes(term) ||
        s.barberia.nombre.toLowerCase().includes(term);
      return matchesCategoria && matchesSearch;
    });

    this.updatePagination();
    this.loading = false;
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredServicios.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedServicios = this.filteredServicios.slice(start, end);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
  }

  getRandomImage(id: any): string {
    return '/barber_hero_bg.png';
  }

  normalizarCategoria(cat: string): string {
    const mapa: Record<string, string> = {
      barba: 'corte de barba',
      tratamientos: 'afeitado clásico',
      tintes: 'tinte',
      'corte de pelo': 'corte de pelo',
    };

    const key = cat.toLowerCase().trim();
    return mapa[key] || key;
  }
}
