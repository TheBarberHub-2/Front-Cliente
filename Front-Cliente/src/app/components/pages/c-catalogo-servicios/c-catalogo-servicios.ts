import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-c-catalogo-servicios',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './c-catalogo-servicios.html',
    styleUrl: './c-catalogo-servicios.scss'
})
export class CCatalogoServicios implements OnInit {
    categoria: string = '';
    searchTerm: string = '';
    allServicios: any[] = [];
    filteredServicios: any[] = [];
    paginatedServicios: any[] = [];
    allBarberias: PeluqueriaSummary[] = [];
    loading: boolean = true;

    // Paginación
    currentPage: number = 1;
    pageSize: number = 6;
    totalPages: number = 1;

    constructor(
        private route: ActivatedRoute,
        private productosService: ProductosService,
        private peluqueriasService: PeluqueriasService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
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
            }
        });
    }

    loadServicios(): void {
        this.productosService.getProductos().subscribe({
            next: (page) => {
                this.allServicios = (page.data || []).map((s: any) => {
                    const index = (s.id || 0) % (this.allBarberias.length || 1);
                    const barberiaReal = this.allBarberias.length > 0
                        ? this.allBarberias[index]
                        : { nombre: 'The Barber Hub', id: 1 };

                    return {
                        ...s,
                        barberia: s.barberia || barberiaReal
                    };
                });
                this.applyFilters();
            },
            error: (err) => {
                console.error('Error cargando servicios', err);
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        const term = this.searchTerm.toLowerCase().trim();

        this.filteredServicios = this.allServicios.filter((s: any) => {
            const matchesCategory = this.categoria === 'Explorar' ||
                s.nombre.toLowerCase().includes(this.categoria.toLowerCase()) ||
                ['Corte de Pelo', 'Barba', 'Tinte'].some(cat =>
                    this.categoria.toLowerCase().includes(cat.toLowerCase())
                );

            const matchesSearch = !term ||
                s.nombre.toLowerCase().includes(term) ||
                s.barberia.nombre.toLowerCase().includes(term);

            return matchesCategory && matchesSearch;
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

    getRandomImage(id: any): string {
        const images = [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621605815841-db897c4733dd?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512690199101-8316d2673838?q=80&w=2070&auto=format&fit=crop'
        ];
        return images[(id || 0) % images.length];
    }
}
