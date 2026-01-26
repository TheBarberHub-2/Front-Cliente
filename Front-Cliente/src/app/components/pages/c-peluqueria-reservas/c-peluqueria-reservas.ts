import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-c-peluqueria-reservas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './c-peluqueria-reservas.html',
    styleUrl: './c-peluqueria-reservas.scss'
})
export class CPeluqueriaReservas implements OnInit {
    reservas: any[] = [];
    loading: boolean = false;

    constructor() { }

    ngOnInit(): void {
        // Para ahora esto es un placeholder
    }
}
