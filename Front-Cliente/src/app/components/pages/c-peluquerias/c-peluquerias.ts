import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';

@Component({
    selector: 'app-c-peluquerias',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './c-peluquerias.html',
    styleUrl: './c-peluquerias.scss'
})
export class CPeluquerias implements OnInit {
    peluquerias: PeluqueriaSummary[] = [];
    filteredPeluquerias: PeluqueriaSummary[] = [];
    searchTerm: string = '';
    loading: boolean = true;

    constructor(private peluqueriasService: PeluqueriasService) { }

    ngOnInit(): void {
        this.loadPeluquerias();
    }

    loadPeluquerias(): void {
        this.peluqueriasService.getPeluquerias().subscribe({
            next: (page) => {
                this.peluquerias = page.data || [];
                this.filteredPeluquerias = [...this.peluquerias];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar peluquerías:', err);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredPeluquerias = [...this.peluquerias];
            return;
        }

        this.filteredPeluquerias = this.peluquerias.filter(p =>
            p.nombre.toLowerCase().includes(term) ||
            p.direccion.toLowerCase().includes(term) ||
            p.municipio.toLowerCase().includes(term)
        );
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
}
