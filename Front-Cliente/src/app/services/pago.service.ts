import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagoTarjetaRequest } from '../models/horarios/pagos/pago-tarjeta.request';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PagoService {
    private apiUrl = 'http:/producciondaw.cip.fpmislata.com/api/pagoTarjeta';

    constructor(private http: HttpClient) { }

    pagoTarjeta(request: PagoTarjetaRequest): Observable<any> {
        return this.http.post<any>(this.apiUrl, request);
    }
}
