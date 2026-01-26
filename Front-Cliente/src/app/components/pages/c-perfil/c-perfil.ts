import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario } from '../../../models/usuarios/usuario';

@Component({
    selector: 'app-c-perfil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './c-perfil.html',
    styleUrl: './c-perfil.scss'
})
export class CPerfil implements OnInit {
    usuario: Usuario | null = null;
    loading: boolean = true;
    error: string = '';

    constructor(private usuariosService: UsuariosService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        const loggedEmail = localStorage.getItem('email');
        this.usuariosService.getUsuarios().subscribe({
            next: (page) => {
                if (page.data && page.data.length > 0) {
                    if (loggedEmail) {
                        this.usuario = page.data.find(u => u.email === loggedEmail) || page.data[0];
                    } else {
                        this.usuario = page.data[0];
                    }
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error al cargar el perfil';
                this.loading = false;
                console.error(err);
            }
        });
    }
}
