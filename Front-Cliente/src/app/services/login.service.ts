import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogIn } from '../models/login';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Rol } from '../enums/rol.enum';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://thebarberhub-back.producciondaw.cip.fpmislata.com/auth';
  private roleSubject = new BehaviorSubject<Rol | null>(null);
  role$ = this.roleSubject.asObservable();
  private emailSubject = new BehaviorSubject<string | null>(localStorage.getItem('email'));
  email$ = this.emailSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isLogged()) {
      this.refreshRol();
    }
  }

  isLogged(): boolean {
    return !!localStorage.getItem('token');
  }

  getRol(): Observable<Rol | null> {
    return this.http.get<any>(this.apiUrl + '/rol').pipe(
      tap((res) => console.log('DEBUG: /rol raw response:', res)),
      map((res) => {
        const rol = typeof res === 'string' ? res : res.rol;
        const normalized = rol ? (rol.toUpperCase() as Rol) : null;
        console.log('DEBUG: /rol normalized:', normalized);
        return normalized;
      }),
      tap((rol) => this.roleSubject.next(rol)),
    );
  }

  refreshRol() {
    this.getRol().subscribe({
      error: () => this.roleSubject.next(null),
    });
  }

  logIn(credentials: LogIn): Observable<void> {
    return this.http.post<{ token: string }>(this.apiUrl + '/login', credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', credentials.email);
        this.emailSubject.next(credentials.email);
      }),
      switchMap(() => this.getRol()),
      map(() => {}),
    );
  }
  logout(): Observable<void> {
    return this.http.delete(this.apiUrl + '/logout').pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('login');
        localStorage.removeItem('email');
        this.emailSubject.next(null);
        this.roleSubject.next(null);
      }),
      catchError((err: any) => {
        console.error('Logout error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('login');
        localStorage.removeItem('email');
        this.roleSubject.next(null);
        return of(undefined);
      }),
      map(() => {}),
    );
  }
}
