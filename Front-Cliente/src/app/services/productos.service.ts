import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { ProductoSummary } from '../models/productos/producto.summary';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Page<ProductoSummary>> {
    return this.http.get<Page<ProductoSummary>>(this.apiUrl);
  }
  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, producto);
  }
  verProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  modificarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto);
  }
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
