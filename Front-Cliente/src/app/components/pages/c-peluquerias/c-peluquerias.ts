import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { PeluqueriaSummary } from '../../../models/peluquerias/peluqueria.summary';

interface PeluqueriaWithSchedule extends PeluqueriaSummary {
    weeklySchedule?: { [key: string]: string };
}

@Component({
    selector: 'app-c-peluquerias',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './c-peluquerias.html',
    styleUrl: './c-peluquerias.scss'
})
export class CPeluquerias implements OnInit {
    peluquerias: PeluqueriaWithSchedule[] = [];
    filteredPeluquerias: PeluqueriaWithSchedule[] = [];
    searchTerm: string = '';
    loading: boolean = true;

    private readonly DAYS_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domigo'];

    constructor(private peluqueriasService: PeluqueriasService) { }

    ngOnInit(): void {
        this.loadPeluquerias();
    }

    loadPeluquerias(): void {
        this.peluqueriasService.getPeluquerias().subscribe({
            next: (page) => {
                this.peluquerias = page.data || [];
                this.filteredPeluquerias = [...this.peluquerias];

                // Fetch schedules for each hairdresser
                this.peluquerias.forEach(p => {
                    if (p.id) {
                        this.peluqueriasService.getHorarios(p.id).subscribe(horarios => {
                            p.weeklySchedule = this.groupHorarios(horarios);
                        });
                    }
                });

                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar peluquerías:', err);
                this.loading = false;
            }
        });
    }

    private groupHorarios(horarios: any[]): { [key: string]: string } {
        const grouped: { [key: string]: string[] } = {};

        horarios.forEach(h => {
            const day = h.diaSemana.toLowerCase();
            if (!grouped[day]) grouped[day] = [];

            const start = String(h.horaApertura).substring(0, 5);
            const end = String(h.horaCierre).substring(0, 5);
            grouped[day].push(`${start}-${end}`);
        });

        const result: { [key: string]: string } = {};
        this.DAYS_ORDER.forEach(day => {
            if (grouped[day]) {
                result[day] = grouped[day].join(' y ');
            }
        });

        return result;
    }

    getOrderedDays(schedule: { [key: string]: string } | undefined): string[] {
        if (!schedule) return [];
        return this.DAYS_ORDER.filter(day => schedule[day]);
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
