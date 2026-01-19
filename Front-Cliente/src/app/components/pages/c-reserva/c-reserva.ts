import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { ProductosService } from '../../../services/productos.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';
import { ProductoSummary } from '../../../models/productos/producto.summary';

@Component({
    selector: 'app-c-reserva',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './c-reserva.html',
    styleUrl: './c-reserva.scss'
})
export class CReserva implements OnInit {
    peluqueria: PeluqueriaSummary | null = null;
    servicios: ProductoSummary[] = [];
    loading: boolean = true;
    peluqueriaId: number = 0;

    constructor(
        private route: ActivatedRoute,
        private peluqueriasService: PeluqueriasService,
        private productosService: ProductosService
    ) { }

    ngOnInit(): void {
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
            },
            error: (err) => console.error('Error al cargar peluquería', err)
        });

        // Cargamos los servicios (productos)
        // NOTA: Como no hay endpoint por ID de peluquería en el servicio actual,
        // cargamos todos los productos. En un entorno real se filtraría por peluqueriaId.
        this.productosService.getProductos().subscribe({
            next: (page) => {
                this.servicios = page.data || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar servicios', err);
                this.loading = false;
            }
        });
    }

    getRandomImage(id: any): string {
        const images = [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621605815841-db897c4733dd?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512690199101-8316d2673838?q=80&w=2070&auto=format&fit=crop'
        ];
        return images[id % images.length];
    }

    confirmarReserva(servicio: ProductoSummary): void {
        alert("Has pulsado el boton, muy bien master pero no está implementado")
    }
}
