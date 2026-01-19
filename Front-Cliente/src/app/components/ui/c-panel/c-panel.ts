import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'panel',
  imports: [RouterLink],
  templateUrl: './c-panel.html',
  styleUrl: './c-panel.scss',
})
export class CPanel {
  @Input() titulo!: string;
  @Input() numero!: number;
}
