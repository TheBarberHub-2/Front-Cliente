import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Page } from '../models/page';
import { Usuario } from '../models/usuarios/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Page<Usuario>> {
    return this.http.get<Page<Usuario>>(this.apiUrl);
  }
  getAvailable(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available`);
  }
  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, usuario);
  }
  verUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  modificarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario);
  }
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
