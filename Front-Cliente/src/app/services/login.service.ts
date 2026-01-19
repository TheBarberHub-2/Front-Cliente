import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogIn } from '../models/login';
import { map, Observable, tap } from 'rxjs';
import { Rol } from '../enums/rol.enum';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}
  getRol(): Observable<Rol> {
    return this.http.get<Rol>(this.apiUrl + '/rol');
  }
  logIn(credentials: LogIn): Observable<void> {
    return this.http.post<{ token: string }>(this.apiUrl + '/login', credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
      }),
      map(() => {})
    );
  }
  logOut(): Observable<void> {
    return this.http
      .delete<void>(this.apiUrl + '/logout')
      .pipe(tap(() => localStorage.removeItem('token')));
  }
}
