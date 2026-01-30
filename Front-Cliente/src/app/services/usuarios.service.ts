import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Page } from '../models/page';
import { Usuario } from '../models/usuarios/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://thebarberhub-back.producciondaw.cip.fpmislata.com/api/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<Page<Usuario>> {
    return this.http.get<Page<Usuario>>(this.apiUrl);
  }
  getAvailable(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available`);
  }
  verUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


}
