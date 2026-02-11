import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { ProductoSummary } from '../models/productos/producto.summary';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = ' producciondaw.cip.fpmislata.com/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Page<ProductoSummary>> {
    return this.http.get<Page<ProductoSummary>>(this.apiUrl);
  }
  verProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
