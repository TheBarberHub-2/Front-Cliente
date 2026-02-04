import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { ProductosService } from '../../../services/productos.service';
import { LoginService } from '../../../services/login.service';
import { Rol } from '../../../enums/rol.enum';
import { Subscription } from 'rxjs';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';
import { ProductoSummary } from '../../../models/productos/producto.summary';
import { PeluqueriaHorario } from '../../../models/peluquerias/peluqueria-horario';

@Component({
  selector: 'app-c-reserva',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  private rolSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private peluqueriasService: PeluqueriasService,
    private productosService: ProductosService,
    private loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.rolSub = this.loginService.role$.subscribe((rol) => {
      this.isPeluqueria = rol === Rol.Peluqueria;
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.peluqueriaId = +idParam;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;

    // Cargamos los datos de la peluquería
    this.peluqueriasService.verPeluqueria(this.peluqueriaId).subscribe({
      next: (data) => {
        this.peluqueria = data;

        // Cargar horarios
        this.peluqueriasService.getHorarios(this.peluqueriaId).subscribe({
          next: (horarios) => {
            this.horarios = this.formatHorarios(horarios);
            console.log('Horarios cargados:', this.horarios);
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

  // Método para agrupar o formatear horarios si fuera necesario
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

  confirmarReserva(servicio: ProductoSummary): void {
    alert('Has pulsado el boton, muy bien master pero no está implementado');
  }

  ngOnDestroy(): void {
    if (this.rolSub) {
      this.rolSub.unsubscribe();
    }
  }
}
