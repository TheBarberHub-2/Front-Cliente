import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudProducto } from '../models/solicitudes/solicitud-producto';
import { SolicitudDto } from '../models/solicitudes/solicitud.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  crearSolicitudProducto(solicitud: SolicitudProducto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/producto`, solicitud);
  }

  getSolicitudesAprobadas(): Observable<SolicitudDto[]> {
    return this.http.get<SolicitudDto[]>(`${this.apiUrl}/aprobadas`);
  }

  confirmarSolicitud(
    id: number,
    pago: {
      numeroTarjeta: string;
      fechaCaducidad: string;
      cvc: string;
      nombreCompleto: string;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/confirmar/peluqueria/${id}`, pago);
  }

  getByUsuario(): Observable<SolicitudDto[]> {
    return this.http.get<SolicitudDto[]>(`${this.apiUrl}/usuario`);
  }

  getSolicitudes(page: number = 1, size: number = 10, peluqueriaId?: number): Observable<any> {
    let params: any = { page: page.toString(), size: size.toString() };
    if (peluqueriaId) {
      params.peluqueriaId = peluqueriaId.toString();
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  crearSolicitudPeluqueria(solicitud: {
    municipio: string;
    direccion: string;
    telefono: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/peluquerias`, solicitud);
  }
}
