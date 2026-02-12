import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearReservaRequest } from '../models/pagos/pago-tarjeta.request';

@Injectable({
    providedIn: 'root',
})
export class ReservasService {
    private apiUrl = 'http://localhost:8080/api/reservas';

    constructor(private http: HttpClient) { }

    crearReserva(request: CrearReservaRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/crear`, request);
    }

    listarReservasCliente(clienteId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
    }
}
