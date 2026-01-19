import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { Categoria } from '../models/categorias/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Page<Categoria>> {
    return this.http.get<Page<Categoria>>(this.apiUrl);
  }
  crearCategoria(categoria: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoria);
  }
  verCategoria(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  modificarCategoria(id: number, categoria: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoria);
  }
  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
