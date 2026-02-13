import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CrearReservaRequest } from '../models/pagos/pago-tarjeta.request';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private apiUrl = 'http://thebarberhub-back.preproducciondaw.cip.fpmislata.com/api/reservas';

  constructor(private http: HttpClient) {}

  crearReserva(request: CrearReservaRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, request);
  }

  listarReservasCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  listarReservasClienteEstado(clienteId: number, estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}/${estado}`);
  }

  listarReservasPeluqueria(peluqueriaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/peluqueria/${peluqueriaId}`);
  }

  listarReservasPeluqueriaEstado(peluqueriaId: number, estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/peluqueria/${peluqueriaId}/${estado}`);
  }

  cancelarReservaCliente(reservaId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cancelar/cliente/${reservaId}`, {});
  }

  cancelarReservaPeluqueria(reservaId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cancelar/peluqueria/${reservaId}`, {});
  }

  confirmarReserva(reservaId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/confirmar/peluqueria/${reservaId}`, {});
  }
}
