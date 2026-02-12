import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { Categoria } from '../models/categorias/categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Page<Categoria>> {
    return this.http.get<Page<Categoria>>(this.apiUrl);
  }
  verCategoria(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
