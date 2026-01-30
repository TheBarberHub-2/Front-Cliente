import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { Page } from '../models/page';
import { PeluqueriaSummary } from '../models/peluquerias/peluqueria.summary';

@Injectable({
  providedIn: 'root',
})
export class PeluqueriasService {
  private apiUrl = 'http://localhost:8080/api/peluquerias';

  constructor(private http: HttpClient) {}

  getPeluquerias(): Observable<Page<PeluqueriaSummary>> {
    return this.http.get<Page<PeluqueriaSummary>>(this.apiUrl);
  }
  verPeluqueria(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByEmail(email: string): Observable<PeluqueriaSummary> {
    return this.http.get<PeluqueriaSummary>(`${this.apiUrl}/by-email?email=${email}`);
  }
}
