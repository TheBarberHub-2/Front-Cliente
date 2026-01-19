import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.html',
    styleUrl: './search.scss',
})
export class SearchComponent {
    @Input() placeholder: string = 'Buscar';
    @Output() search = new EventEmitter<string>();

    searchTerm: string = '';

    onSearch() {
        this.search.emit(this.searchTerm);
    }
}
