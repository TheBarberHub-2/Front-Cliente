import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-c-footer',
  standalone: true,
  imports: [],
  templateUrl: './c-footer.html',
  styleUrl: './c-footer.scss',
})
export class CFooter implements AfterViewInit {
  ngAfterViewInit() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }
}
