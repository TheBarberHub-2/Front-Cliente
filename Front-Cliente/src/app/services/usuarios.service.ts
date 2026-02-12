import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { Page } from '../models/page';
import { Usuario } from '../models/usuarios/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

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

  getUsuarioActual(): Observable<any> {
    const email = localStorage.getItem('email');
    return this.getUsuarios().pipe(
      map(page => {
        const found = page.data ? page.data.find(u => u.email === email) : null;
        if (!found) throw new Error('Usuario no encontrado');
        return found;
      })
    );
  }
}
