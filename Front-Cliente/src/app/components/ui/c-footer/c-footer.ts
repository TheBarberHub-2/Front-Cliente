import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-c-footer',
  standalone: true,
  imports: [],
  templateUrl: './c-footer.html',
  styleUrl: './c-footer.scss',
})
export class CFooter {
  currentYear: number = new Date().getFullYear();
}
