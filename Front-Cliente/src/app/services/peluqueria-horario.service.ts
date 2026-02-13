import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeluqueriaHorario } from '../models/horarios/peluqueria-horario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PeluqueriaHorarioService {
  private apiUrl = `${environment.apiUrl}/peluqueria`;

  constructor(private http: HttpClient) {}

  findByPeluqueria(peluqueriaId: number): Observable<PeluqueriaHorario[]> {
    return this.http.get<PeluqueriaHorario[]>(`${this.apiUrl}/${peluqueriaId}/horarios`);
  }

  create(peluqueriaId: number, horario: PeluqueriaHorario): Observable<PeluqueriaHorario> {
    // Transformar diaSemana al formato esperado por el backend (ej: "Lunes" → "LUNES", "Miércoles" → "MIERCOLES")
    const diasMap: { [key: string]: string } = {
      Lunes: 'LUNES',
      Martes: 'MARTES',
      Miércoles: 'MIERCOLES',
      Jueves: 'JUEVES',
      Viernes: 'VIERNES',
      Sábado: 'SABADO',
      Domingo: 'DOMINGO',
    };

    const diaNormalizado = diasMap[horario.diaSemana] || horario.diaSemana.toUpperCase();

    // Transformar horas al formato LocalTime (HH:mm:ss)
    const formatearHora = (hora: string): string => {
      return hora.length === 5 ? hora + ':00' : hora;
    };

    const horarioTransformado = {
      diaSemana: diaNormalizado,
      horaApertura: formatearHora(horario.horaApertura),
      horaCierre: formatearHora(horario.horaCierre),
    };

    return this.http.post<PeluqueriaHorario>(
      `${this.apiUrl}/${peluqueriaId}/horarios`,
      horarioTransformado,
    );
  }

  update(
    peluqueriaId: number,
    id: number,
    horario: PeluqueriaHorario,
  ): Observable<PeluqueriaHorario> {
    // Transformar diaSemana al formato esperado por el backend (ej: "Lunes" → "LUNES", "Miércoles" → "MIERCOLES")
    const diasMap: { [key: string]: string } = {
      Lunes: 'LUNES',
      Martes: 'MARTES',
      Miércoles: 'MIERCOLES',
      Jueves: 'JUEVES',
      Viernes: 'VIERNES',
      Sábado: 'SABADO',
      Domingo: 'DOMINGO',
    };

    const diaNormalizado = diasMap[horario.diaSemana] || horario.diaSemana.toUpperCase();

    // Transformar horas al formato LocalTime (HH:mm:ss)
    const formatearHora = (hora: string): string => {
      return hora.length === 5 ? hora + ':00' : hora;
    };

    const horarioTransformado = {
      diaSemana: diaNormalizado,
      horaApertura: formatearHora(horario.horaApertura),
      horaCierre: formatearHora(horario.horaCierre),
    };

    return this.http.put<PeluqueriaHorario>(
      `${this.apiUrl}/${peluqueriaId}/horarios/${id}`,
      horarioTransformado,
    );
  }

  delete(peluqueriaId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${peluqueriaId}/horarios/${id}`);
  }
}
