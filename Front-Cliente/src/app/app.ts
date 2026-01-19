import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CHeader } from './components/ui/c-header/c-header';
import { CFooter } from './components/ui/c-footer/c-footer';
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, CHeader, CFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Front-Cliente');
}
