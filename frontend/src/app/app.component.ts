import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HistoriquesComponent } from "./historiques/historiques.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HistoriquesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
