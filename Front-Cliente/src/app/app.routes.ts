import { Routes } from '@angular/router';
import { LandingPage } from './components/pages/landing-page/landing-page';
import { Inicio } from './components/pages/inicio/inicio';
import { CLogin } from './components/pages/c-login/c-login';
import { LoginGuard } from './services/login.guard';
import { CPerfil } from './components/pages/c-perfil/c-perfil';
import { CPeluquerias } from './components/pages/c-peluquerias/c-peluquerias';
import { CReserva } from './components/pages/c-reserva/c-reserva';
import { CCatalogoServicios } from './components/pages/c-catalogo-servicios/c-catalogo-servicios';
import { CPeluqueriaReservas } from './components/pages/c-peluqueria-reservas/c-peluqueria-reservas';
import { CPeluqueriaServicios } from './components/pages/c-peluqueria-servicios/c-peluqueria-servicios';

export const routes: Routes = [
    { path: '', component: LandingPage, pathMatch: 'full' },
    { path: 'login', component: CLogin },
    { path: 'inicio', component: Inicio, canActivate: [LoginGuard] },
    { path: 'usuarios', component: CPerfil, canActivate: [LoginGuard] },
    { path: 'peluquerias', component: CPeluquerias, canActivate: [LoginGuard] },
    { path: 'peluqueria/:id', component: CReserva, canActivate: [LoginGuard] },
    { path: 'mis-reservas', component: CPeluqueriaReservas, canActivate: [LoginGuard] },
    { path: 'mis-servicios', component: CPeluqueriaServicios, canActivate: [LoginGuard] },
    { path: 'servicios/:categoria', component: CCatalogoServicios, canActivate: [LoginGuard] },
    { path: '**', redirectTo: '' }
];
