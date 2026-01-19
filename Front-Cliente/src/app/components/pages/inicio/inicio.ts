import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';

@Component({
    selector: 'app-inicio',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './inicio.html',
    styleUrl: './inicio.scss'
})
export class Inicio implements OnInit {
    searchTerm: string = '';
    allBarberias: PeluqueriaSummary[] = [];
    filteredBarberias: PeluqueriaSummary[] = [];

    categorias = [
        { name: 'Corte de Pelo', icon: '✂️' },
        { name: 'Barba', icon: '🧔' },
        { name: 'Tinte', icon: '🎨' },
        { name: 'Tratamientos', icon: '💆' }
    ];

    constructor(private peluqueriasService: PeluqueriasService) { }

    ngOnInit(): void {
        this.loadBarberias();
    }

    loadBarberias(): void {
        this.peluqueriasService.getPeluquerias().subscribe({
            next: (page) => {
                this.allBarberias = page.data || [];
                this.filteredBarberias = [...this.allBarberias];
            },
            error: (err) => console.error('Error cargando barberías', err)
        });
    }

    onSearch(): void {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredBarberias = [...this.allBarberias];
            return;
        }

        this.filteredBarberias = this.allBarberias.filter(b =>
            b.nombre.toLowerCase().includes(term) ||
            b.direccion.toLowerCase().includes(term) ||
            b.municipio.toLowerCase().includes(term)
        );
    }

    // Método temporal para imágenes aleatorias ya que el summary no trae imagen
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
