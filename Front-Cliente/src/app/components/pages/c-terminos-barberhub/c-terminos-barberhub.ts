import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-c-terminos-barberhub',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './c-terminos-barberhub.html',
    styleUrl: './c-terminos-barberhub.scss'
})
    export class CTerminosBarberhub implements OnInit {
    acceptedTerms: boolean = false;
    loading: boolean = false;
    error: string = '';

    constructor(private router: Router) { }

    ngOnInit(): void {
        // Check if user has pending approval
        const hasApproval = localStorage.getItem('hasApproval');
        if (!hasApproval) {
            this.router.navigate(['/usuarios']);
        }
    }

    proceedToPayment(): void {
        if (!this.acceptedTerms) {
            alert('Debes aceptar los términos y condiciones para continuar.');
            return;
        }

        this.loading = true;
        // TODO: Integrate with payment gateway
        setTimeout(() => {
            alert('Redirigiendo a la pasarela de pago...');
            // this.router.navigate(['/payment']);
            this.loading = false;
        }, 1000);
    }

    get isSubmitDisabled(): boolean {
        return !this.acceptedTerms || this.loading;
    }
}
