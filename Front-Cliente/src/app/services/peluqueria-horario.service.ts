import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeluqueriaHorario } from '../models/horarios/peluqueria-horario';

@Injectable({
    providedIn: 'root',
})
export class PeluqueriaHorarioService {
    private apiUrl = 'http://localhost:8080/api/peluqueria';

    constructor(private http: HttpClient) { }

    findByPeluqueria(peluqueriaId: number): Observable<PeluqueriaHorario[]> {
        return this.http.get<PeluqueriaHorario[]>(`${this.apiUrl}/${peluqueriaId}/horarios`);
    }

    create(peluqueriaId: number, horario: PeluqueriaHorario): Observable<PeluqueriaHorario> {
        return this.http.post<PeluqueriaHorario>(`${this.apiUrl}/${peluqueriaId}/horarios`, horario);
    }

    update(peluqueriaId: number, id: number, horario: PeluqueriaHorario): Observable<PeluqueriaHorario> {
        return this.http.put<PeluqueriaHorario>(`${this.apiUrl}/${peluqueriaId}/horarios/${id}`, horario);
    }

    delete(peluqueriaId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${peluqueriaId}/horarios/${id}`);
    }
}
