import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { PeluqueriaHorarioService } from '../../../services/peluqueria-horario.service';
import { PeluqueriasService } from '../../../services/peluquerias.service';
import { Usuario } from '../../../models/usuarios/usuario';
import { SolicitudDto } from '../../../models/solicitudes/solicitud.dto';
import { PeluqueriaHorario } from '../../../models/horarios/peluqueria-horario';
import { Rol } from '../../../enums/rol.enum';
import { switchMap, of, forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-c-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './c-perfil.html',
  styleUrl: './c-perfil.scss',
})
export class CPerfil implements OnInit {
  usuario: Usuario | null = null;
  solicitudesAprobadas: SolicitudDto[] = [];
  horarios: PeluqueriaHorario[] = [];
  peluqueriaId: number | null = null;

  loading: boolean = true;
  error: string = '';

  showHorarioForm: boolean = false;
  showEditarHorarioForm: boolean = false;
  horarioEnEdicion: PeluqueriaHorario | null = null;
  nuevoHorario: PeluqueriaHorario = {
    diaSemana: 'Lunes',
    horaApertura: '09:00',
    horaCierre: '20:00',
  };
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  showSolicitudPeluqueriaForm: boolean = false;
  nuevaSolicitudPeluqueria = {
    municipio: '',
    direccion: '',
    telefono: '',
  };

  constructor(
    private usuariosService: UsuariosService,
    private solicitudesService: SolicitudesService,
    private horarioService: PeluqueriaHorarioService,
    private peluqueriasService: PeluqueriasService,
    private router: Router,
  ) {}

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

    this.usuariosService
      .getUsuarios()
      .pipe(
        switchMap((page) => {
          const found = page.data ? page.data.find((u) => u.email === loggedEmail) : null;
          if (!found) return of(null);
          this.usuario = found;

          const requests: { [key: string]: any } = {};

          if (found.rol.toUpperCase() === Rol.Cliente) {
            requests['solicitudesAprobadas'] = this.solicitudesService.getSolicitudesAprobadas();
          } else {
            requests['solicitudesAprobadas'] = of([]);
          }

          if (found.rol.toUpperCase() === Rol.Peluqueria) {
            requests['peluqueria'] = this.peluqueriasService.getByEmail(found.email);
          } else {
            requests['peluqueria'] = of(null);
          }

          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (result: any) => {
          if (result) {
            this.solicitudesAprobadas = result.solicitudesAprobadas || [];
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
        },
      });
  }

  loadHorarios() {
    if (!this.peluqueriaId) {
      return;
    }
    this.horarioService.findByPeluqueria(this.peluqueriaId).subscribe({
      next: (horarios) => {
        this.horarios = horarios || [];
      },
      error: (err) => {
        this.horarios = [];
      },
    });
  }

  irATerminos(id: number) {
    localStorage.setItem('hasApproval', id.toString());
    this.router.navigate(['/terminos']);
  }

  abrirFormHorario() {
    this.showHorarioForm = true;
    this.nuevoHorario = {
      diaSemana: 'Lunes',
      horaApertura: '09:00',
      horaCierre: '20:00',
    };
  }

  guardarHorario() {
    if (!this.peluqueriaId) return;

    this.horarioService.create(this.peluqueriaId, this.nuevoHorario).subscribe({
      next: () => {
        this.showHorarioForm = false;
        this.loadHorarios();
      },
      error: () => alert('Error al guardar el horario.'),
    });
  }

  eliminarHorario(id: number) {
    if (!this.peluqueriaId || !confirm('¿Estás seguro de eliminar este horario?')) return;

    this.horarioService.delete(this.peluqueriaId, id).subscribe({
      next: () => this.loadHorarios(),
      error: () => alert('Error al eliminar el horario.'),
    });
  }

  abrirEditarHorario(horario: PeluqueriaHorario) {
    const diasMapInverso: { [key: string]: string } = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };

    this.horarioEnEdicion = { ...horario };
    if (this.horarioEnEdicion.diaSemana) {
      this.horarioEnEdicion.diaSemana =
        diasMapInverso[this.horarioEnEdicion.diaSemana.toUpperCase()] ||
        this.horarioEnEdicion.diaSemana;
    }
    this.showEditarHorarioForm = true;
  }

  guardarCambiosHorario() {
    if (!this.peluqueriaId || !this.horarioEnEdicion || !this.horarioEnEdicion.id) return;

    this.horarioService
      .update(this.peluqueriaId, this.horarioEnEdicion.id, this.horarioEnEdicion)
      .subscribe({
        next: () => {
          this.showEditarHorarioForm = false;
          this.horarioEnEdicion = null;
          this.loadHorarios();
        },
        error: () => alert('Error al guardar los cambios del horario.'),
      });
  }

  get isPeluqueria(): boolean {
    return this.usuario?.rol?.toUpperCase() === Rol.Peluqueria;
  }

  get isCliente(): boolean {
    return this.usuario?.rol?.toUpperCase() === Rol.Cliente;
  }

  get hasPendingPeluqueriaRequest(): boolean {
    return this.solicitudesAprobadas.some(
      (s) => s.tipo === 'Peluqueria' && (s.estado === 'Pendiente' || s.estado === 'Aprobada'),
    );
  }

  abrirFormSolicitudPeluqueria() {
    this.showSolicitudPeluqueriaForm = true;
    this.nuevaSolicitudPeluqueria = { municipio: '', direccion: '', telefono: '' };
  }

  onSubmitSolicitudPeluqueria() {
    this.solicitudesService.crearSolicitudPeluqueria(this.nuevaSolicitudPeluqueria).subscribe({
      next: () => {
        alert('¡Solicitud enviada! Recibirás una notificación cuando sea revisada.');
        this.showSolicitudPeluqueriaForm = false;
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al enviar la solicitud.');
      },
    });
  }
}
