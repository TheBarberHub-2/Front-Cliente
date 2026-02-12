import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    duracion: number;
    peluqueriaId: number;
    peluqueriaNombre: string;
}

export interface CarritoRequest {
    peluqueriaId: number;
    productoIds: number[];
}

export interface CarritoResponse {
    precioTotal: number;
    duracionTotal: number;
    productos?: any[];
}

export interface SlotsDisponiblesRequest {
    peluqueriaId: number;
    fecha: string; // ISO string YYYY-MM-DD
    duracionTotal: number;
}

export interface SlotsDisponiblesResponse {
    peluqueriaId: number;
    fecha: string;
    horasDisponibles: string[];
}

@Injectable({
    providedIn: 'root',
})
export class CarritoService {
    private apiUrl = 'http://localhost:8080/api/carrito';
    private items: CartItem[] = [];
    private cartSubject = new BehaviorSubject<CartItem[]>([]);
    public cart$ = this.cartSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadCart();
    }

    addToCart(item: CartItem) {
        // Regla: Solo permitir productos de la misma peluquería en el carrito por ahora
        // o al menos avisar. El backend solo soporta una peluquería por reserva.
        if (this.items.length > 0 && this.items[0].peluqueriaId !== item.peluqueriaId) {
            if (confirm('Tu carrito contiene productos de otra peluquería. ¿Deseas vaciarlo para añadir servicios de esta?')) {
                this.items = [];
            } else {
                return;
            }
        }

        const exists = this.items.find(i => i.id === item.id);
        if (!exists) {
            this.items.push(item);
            this.updateCart();
        }
    }

    removeFromCart(id: number) {
        this.items = this.items.filter(i => i.id !== id);
        this.updateCart();
    }

    clearCart() {
        this.items = [];
        this.updateCart();
    }

    private updateCart() {
        this.cartSubject.next([...this.items]);
        this.saveCart();
    }

    private saveCart() {
        localStorage.setItem('cart_items', JSON.stringify(this.items));
    }

    private loadCart() {
        const saved = localStorage.getItem('cart_items');
        if (saved) {
            this.items = JSON.parse(saved);
            this.cartSubject.next([...this.items]);
        }
    }

    calcularCarrito(request: CarritoRequest): Observable<CarritoResponse> {
        const selectedItems = this.items.filter(i => request.productoIds.includes(i.id));
        const precioTotal = selectedItems.reduce((acc, item) => acc + item.precio, 0);
        const duracionTotal = selectedItems.reduce((acc, item) => acc + item.duracion, 0);

        return of({
            precioTotal,
            duracionTotal,
            productos: selectedItems
        });
    }

    obtenerSlotsDisponibles(request: SlotsDisponiblesRequest): Observable<SlotsDisponiblesResponse> {
        return this.http.post<SlotsDisponiblesResponse>(`${this.apiUrl}/horarios/disponibles`, request);
    }
}
