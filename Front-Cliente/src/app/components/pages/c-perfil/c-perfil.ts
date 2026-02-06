import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { PeluqueriaHorarioService } from '../../../services/peluqueria-horario.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { Usuario } from '../../../models/usuarios/usuario';
import { SolicitudDto } from '../../../models/solicitudes/solicitud.dto';
import { PeluqueriaHorario } from '../../../models/horarios/peluqueria-horario';
import { Rol } from '../../../enums/rol.enum';
import { switchMap, of, forkJoin } from 'rxjs';

@Component({
    selector: 'app-c-perfil',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './c-perfil.html',
    styleUrl: './c-perfil.scss'
})
export class CPerfil implements OnInit {
    usuario: Usuario | null = null;
    solicitudes: SolicitudDto[] = [];
    horarios: PeluqueriaHorario[] = [];
    peluqueriaId: number | null = null;

    loading: boolean = true;
    error: string = '';

    // Schedule Modal/Form
    showHorarioForm: boolean = false;
    nuevoHorario: PeluqueriaHorario = {
        diaSemana: 'Lunes',
        horaApertura: '09:00',
        horaCierre: '20:00'
    };
    diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    constructor(
        private usuariosService: UsuariosService,
        private solicitudesService: SolicitudesService,
        private horarioService: PeluqueriaHorarioService,
        private peluqueriasService: PeluqueriasService
    ) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        const loggedEmail = localStorage.getItem('email');
        if (!loggedEmail) {
            this.error = 'No se ha encontrado sesión activa';
            this.loading = false;
            return;
        }

        this.usuariosService.getUsuarios().pipe(
            switchMap((page) => {
                const found = page.data ? page.data.find(u => u.email === loggedEmail) : null;
                if (!found) return of(null);
                this.usuario = found;

                // Fetch ALL solicituds for the user (using the new paginated admin-style request)
                const solicitudesSub = this.solicitudesService.getSolicitudes(1, 100, found.id);

                return forkJoin({
                    allSolicitudes: solicitudesSub,
                    peluqueria: found.rol === Rol.Peluqueria ? this.peluqueriasService.getByEmail(found.email) : of(null)
                });
            })
        ).subscribe({
            next: (result: any) => {
                if (result) {
                    this.solicitudes = result.allSolicitudes.data || [];
                    if (result.peluqueria) {
                        this.peluqueriaId = result.peluqueria.id;
                        this.loadHorarios();
                    }
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error al cargar el perfil y servicios';
                this.loading = false;
                console.error(err);
            }
        });
    }

    loadHorarios() {
        if (this.peluqueriaId) {
            this.horarioService.findByPeluqueria(this.peluqueriaId).subscribe({
                next: (horarios) => this.horarios = horarios,
                error: (err) => console.error('Error al cargar horarios:', err)
            });
        }
    }

    confirmarSolicitud(id: number) {
        this.solicitudesService.confirmarSolicitud(id).subscribe({
            next: () => {
                alert('Solicitud confirmada con éxito. ¡Bienvenido!');
                this.loadProfile(); // Refresh for role changes etc
            },
            error: (err) => {
                console.error('Error al confirmar:', err);
                alert('Error al confirmar la solicitud.');
            }
        });
    }

    // Schedule Management
    abrirFormHorario() {
        this.showHorarioForm = true;
        this.nuevoHorario = {
            diaSemana: 'Lunes',
            horaApertura: '09:00',
            horaCierre: '20:00'
        };
    }

    guardarHorario() {
        if (!this.peluqueriaId) return;

        this.horarioService.create(this.peluqueriaId, this.nuevoHorario).subscribe({
            next: () => {
                this.showHorarioForm = false;
                this.loadHorarios();
            },
            error: (err) => alert('Error al guardar el horario.')
        });
    }

    eliminarHorario(id: number) {
        if (!this.peluqueriaId || !confirm('¿Estás seguro de eliminar este horario?')) return;

        this.horarioService.delete(this.peluqueriaId, id).subscribe({
            next: () => this.loadHorarios(),
            error: (err) => alert('Error al eliminar el horario.')
        });
    }

    get isPeluqueria(): boolean {
        return this.usuario?.rol === Rol.Peluqueria;
    }
}
